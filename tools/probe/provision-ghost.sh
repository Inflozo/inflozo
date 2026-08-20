#!/usr/bin/env bash
# Provision a Ghost probe box — §4's targets T1 (6.x) and T3 (5.x).
#
# The canonical Ghost-CLI production install, not a container: nginx, MySQL 8,
# systemd, Let's Encrypt. That shape is deliberate — VERIFY item 3 asks for
# "theme-upload size limits per host", and Ghost-CLI's own nginx config IS the
# answer, so hand-rolling it would measure our config instead of a real one.
#
#   ssh root@<host> 'bash -s' < provision-ghost.sh \
#       <mysql_pw> <url> <ssl_email> <ghost_version> <expected_gscan>
#
# The expected gscan version is REQUIRED and asserted at the end. AD-34 makes the
# version a Ghost major BUNDLES the gate's input, so a box whose pairing has moved
# is worse than no box — it produces verdicts that look comparable and are not.
#
# Idempotent enough to re-run after a rebuild. Every step reports.
set -uo pipefail

MYSQL_PW="${1:?mysql root password required}"
GHOST_URL="${2:?url required, e.g. https://ghost5.inflozo.com}"
SSL_EMAIL="${3:?ssl email required}"
GHOST_VERSION="${4:?ghost version required, e.g. 5.130.6}"
GSCAN_EXPECTED="${5:?expected bundled gscan required, e.g. 4.49.7}"

MAJOR="${GHOST_VERSION%%.*}"
# Node 22 satisfies both majors: Ghost 5 wants ^18.12.1 || ^20.11.1 || ^22.13.1,
# Ghost 6 wants ^22.23.1 exactly.
NODE_MAJOR="22"
GHOST_DIR="/var/www/ghost${MAJOR}"
GHOST_USER="ghostadmin"          # Ghost-CLI refuses to run as root
DB_NAME="ghost${MAJOR}_prod"

say() { printf '\n\033[1;36m== %s\033[0m\n' "$*"; }
ok()  { printf '   \033[32mok\033[0m %s\n' "$*"; }
die() { printf '\n\033[1;31mFAILED: %s\033[0m\n' "$*"; exit 1; }

say "0. Preflight"
[ "$(id -u)" -eq 0 ] || die "run this as root"
. /etc/os-release; ok "$PRETTY_NAME"
ok "$(nproc) vCPU, $(free -m | awk '/^Mem:/{print $2}') MB RAM"

say "1. Swap — 2 GB"
# Ghost's own install docs recommend swap at 1 GB. MySQL 8 plus Ghost plus a
# gscan run over a 10 MB theme is the peak that OOMs a small box.
if swapon --show | grep -q swap; then
  ok "swap already present: $(swapon --show=SIZE --noheadings | tr -d ' ')"
else
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap -q /swapfile && swapon /swapfile \
    || die "swap creation failed"
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl -qw vm.swappiness=10
  grep -q '^vm.swappiness' /etc/sysctl.conf || echo 'vm.swappiness=10' >> /etc/sysctl.conf
  ok "2 GB swap active and persisted"
fi

say "2. System packages"
export DEBIAN_FRONTEND=noninteractive
apt-get -qq update || die "apt update"
apt-get -qq -y upgrade >/dev/null || die "apt upgrade"
apt-get -qq -y install ca-certificates curl gnupg ufw >/dev/null
ok "base packages"

say "3. Node ${NODE_MAJOR} (NodeSource)"
if ! command -v node >/dev/null || [ "$(node -v | cut -c2- | cut -d. -f1)" != "$NODE_MAJOR" ]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash - >/dev/null 2>&1 || die "nodesource"
  apt-get -qq -y install nodejs >/dev/null || die "node install"
fi
ok "node $(node -v), npm $(npm -v)"

say "4. nginx"
apt-get -qq -y install nginx >/dev/null || die "nginx"
systemctl enable -q --now nginx
ok "nginx $(nginx -v 2>&1 | sed 's|.*/||')"

say "5. MySQL 8"
apt-get -qq -y install mysql-server >/dev/null || die "mysql"
systemctl enable -q --now mysql
# Ghost-CLI connects as root over TCP with a password. Ubuntu's default is
# auth_socket, which it cannot use, so give root a password.
mysql --protocol=socket -uroot <<SQL || die "could not set the mysql root password"
ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY '${MYSQL_PW}';
FLUSH PRIVILEGES;
SQL
ok "mysql $(mysql --version | grep -oP 'Ver \K[0-9.]+') — root password set"

say "6. Firewall"
ufw allow OpenSSH >/dev/null 2>&1
ufw allow 'Nginx Full' >/dev/null 2>&1
ufw --force enable >/dev/null 2>&1
ok "ufw: $(ufw status | head -1)"

say "7. Non-root user for Ghost-CLI"
if ! id -u "$GHOST_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$GHOST_USER" >/dev/null
  usermod -aG sudo "$GHOST_USER"
  ok "created $GHOST_USER"
fi
# passwordless sudo so `ghost install --no-prompt` never blocks on a password
echo "$GHOST_USER ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/90-$GHOST_USER"
chmod 440 "/etc/sudoers.d/90-$GHOST_USER"
# carry root's authorized key across so the same SSH key reaches this user
install -d -m 700 -o "$GHOST_USER" -g "$GHOST_USER" "/home/$GHOST_USER/.ssh"
cp /root/.ssh/authorized_keys "/home/$GHOST_USER/.ssh/authorized_keys"
chown "$GHOST_USER:$GHOST_USER" "/home/$GHOST_USER/.ssh/authorized_keys"
chmod 600 "/home/$GHOST_USER/.ssh/authorized_keys"
ok "$GHOST_USER has sudo and the SSH key"

say "8. Ghost-CLI"
npm install -g ghost-cli@latest >/dev/null 2>&1 || die "ghost-cli install"
ok "ghost-cli $(ghost version 2>/dev/null | grep -oP 'Ghost-CLI version: \K.*' || echo '?')"

say "9. ghost install ${GHOST_VERSION} (major ${MAJOR}) into ${GHOST_DIR}"
install -d -m 775 -o "$GHOST_USER" -g "$GHOST_USER" "$GHOST_DIR"
sudo -u "$GHOST_USER" -H bash -c "cd '$GHOST_DIR' && ghost install '$GHOST_VERSION' \
  --no-prompt \
  --url '$GHOST_URL' \
  --db mysql --dbhost localhost --dbuser root --dbpass '$MYSQL_PW' --dbname '$DB_NAME' \
  --process systemd \
  --sslemail '$SSL_EMAIL' \
  --start" || die "ghost install — see the output above"

say "10. Verify — the pairing AD-34 rests on"
GSCAN=$(grep -m1 '"version"' "$GHOST_DIR/current/node_modules/gscan/package.json" | grep -oP '[0-9]+\.[0-9]+\.[0-9]+')
GHOSTV=$(grep -m1 '"version"' "$GHOST_DIR/current/package.json" | grep -oP '[0-9]+\.[0-9]+\.[0-9]+')
echo "   ghost   $GHOSTV"
echo "   gscan   $GSCAN"
[ "$GHOSTV" = "$GHOST_VERSION" ] || die "expected ghost $GHOST_VERSION, got $GHOSTV"
[ "$GSCAN" = "$GSCAN_EXPECTED" ] || die "expected gscan $GSCAN_EXPECTED, got $GSCAN — AD-34's pairing has MOVED for Ghost $MAJOR and MEASUREMENTS §13 is stale for it"
ok "ghost $GHOSTV bundles gscan $GSCAN — matches MEASUREMENTS §13"

say "11. The host's theme-upload ceiling (VERIFY item 3)"
grep -rhoP 'client_max_body_size\s+\K[^;]+' /etc/nginx/ 2>/dev/null | sort -u | sed 's/^/   nginx client_max_body_size: /'
free -m | head -2 | sed 's/^/   /'

printf '\n\033[1;32mDONE.\033[0m Finish setup at %s/ghost/\n\n' "$GHOST_URL"
