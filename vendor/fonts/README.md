# Fonts

The Big Feeling wordmark uses Literata (optical size 36, weight 650), positioned
glyph by glyph to match the supplied reference. The logo contains outlines, so preview and exports do not
depend on installed fonts or external requests.

Sources, downloaded from the Google Fonts repository:

- https://github.com/google/fonts/tree/main/ofl/literata

Literata is licensed under the SIL Open Font License 1.1; the complete license is
included here and in production output. Regenerate `src/logo-wordmark.js` with
`scripts/outline-wordmark.py` and the upright variable TTF file from this directory.

The homepage also uses bundled Literata instances at optical size 36 and weights
400 and 650, plus Inter Regular. Weight 650 matches the wordmark and is used by
the title, caption, and emphasized subtitle copy; weight 400 is used by the rest
of the subtitle. Inter was downloaded from the Google Fonts CSS API on
2026-09-20; the Literata instances were generated from the Google Fonts variable
TTF on 2026-10-02. Inter is also licensed under the SIL Open Font License 1.1; see `INTER-OFL.txt` and
https://github.com/google/fonts/tree/main/ofl/inter. Both licenses are included
in production output. There are no external font requests at runtime.
