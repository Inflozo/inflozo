#!/usr/bin/env bash
# Read-only health and intrusion check of a test Ghost droplet (T1 today). Changes nothing on the server.
# Kept from the T3 incident (docs/incident-2026-10-03-t3.md, R-238), where these exact reads found the way in.
#
#   bash tools/probe/server-triage.sh <droplet-ip> > /tmp/triage.txt
#
# THE OWNER RUNS IT, not Claude: the auto-mode classifier refuses Claude's own SSH reads of the test servers even
# after an in-session go, so Claude writes the output path into the ask and reads the file afterwards.
# What a clean server looks like: no executables in /tmp, /var/tmp or /dev/shm; no `ghost`-user process other than
# `ghost run` and `node`; no outbound connection but DNS and MySQL; every theme upload from the owner's IP with an
# `inflozo-probe-` name; nobody but the owner and our own integrations in Ghost's actions log.
ssh -a -o BatchMode=yes -o ConnectTimeout=10 "root@${1:?droplet ip}" 'bash -s' <<'EOF' 2>&1
G=$(ls -d /var/www/ghost[0-9]* | head -1); echo "== $G, $(grep -m1 '"version"' $G/current/package.json)"; uptime
echo "== processes run by the ghost user (expect only 'ghost run' and node)"; ps -u ghost -o pid,ppid,lstart,comm,args --forest | cut -c1-160
for p in $(ps -u ghost -o pid=,comm= | awk '$2!="node" && $2!="ghost" {print $1}'); do echo "-- pid $p: $(ls -l /proc/$p/exe 2>&1 | sed 's/.*-> //')"; done
echo "== top cpu"; ps -eo pid,user,pcpu,etime,comm --sort=-pcpu | head -8
echo "== outbound connections other than web/ssh"; ss -tunp state established 2>/dev/null | grep -vE ':(22|443|80)\s' | head -20
echo "== executables in tmp"; find /tmp /var/tmp /dev/shm -type f -perm -u+x 2>/dev/null | head
echo "== crontabs"; for u in $(cut -d: -f1 /etc/passwd); do c=$(crontab -l -u $u 2>/dev/null | grep -v '^#'); [ -n "$c" ] && echo "[$u] $c"; done
echo "== ssh: keys, settings, logins in 30 days"
for f in /root/.ssh/authorized_keys /home/*/.ssh/authorized_keys; do echo "$f: $(awk '{print $NF}' $f | tr '\n' ' ')"; done
sshd -T 2>/dev/null | grep -iE '^(passwordauthentication|permitrootlogin)'
journalctl -u ssh --since -30d 2>/dev/null | grep 'Accepted ' | awk '{print $1,$2,$9,$11}' | sort | uniq -c | tail -10
echo "== installed themes"; ls -la --time-style=full-iso $G/content/themes/ | grep -v '^total'
echo "== theme uploads and activations, by IP (all kept logs)"
zcat -f /var/log/nginx/access.log* 2>/dev/null | grep -E 'themes/upload|themes/[^/ ]+/activate' | awk '{print $1, $4, $6, $7, $9}' | tail -20
echo "== admin API requests by IP"; zcat -f /var/log/nginx/access.log* 2>/dev/null | grep '/ghost/api/admin' | awk '{print $1}' | sort | uniq -c | sort -rn | head -12
echo "== Content API filters carrying SQL (the T3 attack)"; zcat -f /var/log/nginx/access.log* 2>/dev/null | grep -iE '/ghost/api/content/.*filter=.*(CASE%20WHEN|SELECT|EXP%28)' | awk '{print $1, $4}' | sort | uniq -c | tail -10
cd $G && node -e '
const c=require("./config.production.json").database.connection;
const {execFileSync}=require("child_process");
const run=q=>{try{process.stdout.write(execFileSync("mysql",["-u",c.user,"-h",c.host,"-t",c.database,"-e",q],{env:{...process.env,MYSQL_PWD:c.password}}).toString())}catch(e){console.log("query failed:",String(e.stderr||e).slice(0,200))}};
console.log("== Ghost actions log, last 14 days, by actor");
run(`SELECT a.actor_type, COALESCE(i.name,u.email,a.actor_id) actor, a.resource_type, a.event, COUNT(*) n, MAX(a.created_at) last FROM actions a LEFT JOIN integrations i ON i.id=a.actor_id LEFT JOIN users u ON u.id=a.actor_id WHERE a.created_at > NOW() - INTERVAL 14 DAY GROUP BY 1,2,3,4 ORDER BY last DESC LIMIT 30`);
console.log("== staff users"); run(`SELECT email, status, last_seen FROM users`);
console.log("== code injection (lengths only)"); run("SELECT `key`, LENGTH(value) len, updated_at FROM settings WHERE `key` IN (\"codeinjection_head\",\"codeinjection_foot\")");'
EOF
