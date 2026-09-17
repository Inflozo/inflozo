# The render matrix's runner (Story 4.11, NFR-6(a)): "the runner is part of the baseline". One Playwright, one
# Chromium, one set of fonts — pinned here, recorded in tools/matrix/manifest.json, and never varied.
#
# The base is pinned by tag AND digest, so a re-pushed tag cannot change a baseline under us.
FROM mcr.microsoft.com/playwright:v1.61.1-noble@sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48

# THE FONTS ARE A GATE, NOT POLISH (executed 2026-09-17): the stock image resolves Georgia, Inter, serif and sans-serif
# to WenQuanYi Zen Hei, a CJK face, so every baseline would be a pilot photographed in a Chinese fallback.
# The reference token set names `Georgia, serif` and `'Inter', sans-serif` (packages/section-runtime/src/tokens.ts).
#   Inter   — apt's fonts-inter, pinned to the version checked in the image.
#   Georgia — Gelasio, Georgia's metric-compatible face, which apt does not carry: fetched from google/fonts at one
#             commit and pinned by checksum, so a changed file fails the build rather than a baseline.
#   serif / sans-serif — DejaVu, so a generic fallback is a Latin face and never the CJK one.
RUN apt-get update \
 && apt-get install -y --no-install-recommends fonts-inter=4.0+ds-1 fonts-dejavu-core=2.37-8 \
 && rm -rf /var/lib/apt/lists/*
# The checksum is checked by `sha256sum -c`, not by `ADD --checksum`: the legacy builder ignores that flag and builds a
# wrong file happily (executed 2026-09-17 with an all-zero checksum), and this image is built by both builders.
ADD https://github.com/google/fonts/raw/a60a77e14f28abd4ef243a1b5dfc48df0cec5205/ofl/gelasio/Gelasio%5Bwght%5D.ttf \
    /usr/share/fonts/truetype/gelasio/Gelasio-wght.ttf
ADD https://github.com/google/fonts/raw/a60a77e14f28abd4ef243a1b5dfc48df0cec5205/ofl/gelasio/Gelasio-Italic%5Bwght%5D.ttf \
    /usr/share/fonts/truetype/gelasio/Gelasio-Italic-wght.ttf
COPY fonts.conf /etc/fonts/local.conf
RUN cd /usr/share/fonts/truetype/gelasio \
 && printf '%s  %s\n' \
      4daecea457258c9ebeb8bc99ed3fd24353618bfad3ea4b93fa0b5d0468fc04e4 Gelasio-wght.ttf \
      52559e845a4d33514e5f93bb9ae7dbeae1894a53f2c565a15f18af40cd337c09 Gelasio-Italic-wght.ttf \
    | sha256sum -c - \
 && chmod 644 *.ttf && fc-cache -f \
 && fc-match Georgia | tee /dev/stderr | grep -q '"Gelasio"' \
 && fc-match Inter | tee /dev/stderr | grep -q '"Inter"' \
 && fc-match serif | tee /dev/stderr | grep -vq 'WenQuanYi' \
 && fc-match sans-serif | tee /dev/stderr | grep -vq 'WenQuanYi'

# What the harness reads to know it is inside this image: only here may a baseline be written.
ENV INFLOZO_MATRIX_IMAGE=1
