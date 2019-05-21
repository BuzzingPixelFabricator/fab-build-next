# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.1] - 2019-05-20
### Fixed 
- Fixed an issue in the JavascriptOneToOne process where file locations were being muddled and incorrectly set

## [1.9.0] - 2019-05-11
### Added 
- Added jsFileExtensions option to config file to allow more than just .js file extensions
- Added JS One to One mode
    - In this mode, JS files are minified to their location in the JS directory rather than concatenated into one file

## [1.8.0] - 2019-03-23
### Added 
- Added file sync feature

## [1.7.1] - 2019-03-22
### Fixed 
- Fixed an issue where ES6 code would not compile

## [1.7.0] - 2019-03-22
### Added 
- Added ESLint-ing

## [1.6.0] - 2019-03-21
### Added 
- Added flag `--build-only` (or `--build`) to build project but not watch for changes
### Changed
- Updated all packages
- Switched to Yarn internally for managing packages

## [1.5.1] - 2019-01-02
### Fixed 
- Fixed an issue with post css and preserving custom property replacements

## [1.5.0] - 2019-01-02
### Added 
- Added ability to set watch to use polling rather than file events
### Changed
- Updated all NPM dependencies to latest version(s)

## [1.4.1] - 2018-01-30
### Fixed 
- Fixed a code typo in the javascript file building section that would cause the build process to fail if any files for building in were defined in the project file

## [1.4.0] - 2018-01-19
### Added 
- Added Windows compatibility

## [1.3.0] - 2018-01-13
### Added 
- Added ability to use inline comment style (`// An inline comment`) to source files
- Added parsing of media queries in the last .segment of a source file name
    - i.e. `MyFile.0000.pcss` would be placed first and not have a media query
    - `MyFile.0500.pcss` would be placed in a media query at min-width 500px
    - Any files using this media query method are all concatenated into one set of media queries

## [1.2.0] - 2017-12-30
### Added 
- Added HexRGBA

## [1.1.0] - 2017-11-07
### Added 
- Added the ability to post errors to a URL
### Changed 
- Updated error reporting on console to be a little bit better

## [1.0.1] - 2017-10-31
### Fixed
- Fixed an issue where modules with resets would not be able to define that the reset should come first in the build process
- Attempted to improve BrowserSync behavior and debouncing

## [1.0.0] - 2017-10-30
### Added 
- Initial Release
