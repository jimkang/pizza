include config.mk

HOMEDIR = $(shell pwd)
BROWSERIFY = node_modules/.bin/browserify
UGLIFY = ./node_modules/uglify-es/bin/uglifyjs
TRANSFORM_SWITCH = -t [ babelify --presets [ es2015 ] ]

test:
	node tests/basictests.js

run: 
	wzrd app.js:index.js -- \
		-d

build:
	$(BROWSERIFY) $(TRANSFORM_SWITCH) app.js | $(UGLIFY) -c -m -o index.js

pushall: sync
	git push origin master

prettier:
	prettier --single-quote --write "**/*.js"

sync:
	rsync -a $(HOMEDIR)/ $(USER)@$(SERVER):/$(APPDIR) --exclude node_modules/ \
		--omit-dir-times --no-perms

