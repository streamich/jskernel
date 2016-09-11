#FROM alpine
FROM scratch

COPY dist/full.js /modules/full.js
COPY runtime/duktape/full-duktape /bin/js
COPY examples/ /samples

ENTRYPOINT ["/bin/js", "/modules/full.js"]


