# Fonts

The Big Feeling wordmark uses Literata (optical size 36, weight 650), positioned
glyph by glyph to match the supplied reference. The logo contains outlines, so preview and exports do not
depend on installed fonts or external requests.

Sources, downloaded from the Google Fonts repository:

- https://github.com/google/fonts/tree/main/ofl/literata

Literata is licensed under the SIL Open Font License 1.1; the complete license is
included here and in production output. Regenerate `src/logo-wordmark.js` with
`scripts/outline-wordmark.py` and the upright variable TTF file from this directory.

The homepage also uses a bundled Literata instance at optical size 36 and weight
650 to match the wordmark, plus Inter Regular. The Literata face is used by the
title, subtitle, and caption. Inter was downloaded from the Google Fonts CSS API
on 2026-09-20; the Literata instance was generated from the Google Fonts variable
TTF on 2026-10-02. Inter is also licensed under the SIL Open Font License 1.1; see `INTER-OFL.txt` and
https://github.com/google/fonts/tree/main/ofl/inter. Both licenses are included
in production output. There are no external font requests at runtime.
