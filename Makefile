.PHONY: build clean

# Extension name
NAME = page-delay

# Files to include in the extension
FILES = manifest.json \
        background.js \
        countdown.html \
        countdown.js \
        settings.html \
        settings.js \
        icons/

# Build the extension zip
build:
	@rm -f $(NAME).zip
	zip -r $(NAME).zip $(FILES)
	@echo "Created $(NAME).zip"

# Clean up build artifacts
clean:
	rm -f $(NAME).zip
