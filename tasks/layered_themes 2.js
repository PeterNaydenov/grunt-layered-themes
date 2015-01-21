/*
 * grunt-layered-themes
 * https://github.com/peternaydenov/grunt-layered-themes
 *
 * Copyright (c) 2015 Peter Naydenov
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('layered_themes', 'Plugin framework for CSS themes.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options ({
                                  config       : {}
                                , preprocessor : {}
                                , content      : []
                                , keys         : []
                                , saveConfig   : {}
                                , engine       : '5devices'       /* engine name*/
                                , configFile   : 'dev/_css.json'  /* engine config file path */
                                , src          : 'dev/css-dev'    /* CSS working folder */
                                , target       : 'www/css'        /* CSS production folder */
                                , mainKey      : 'main'           /* main is the default value */
                              });







// STEP 1 - read settings from config.json and prepare configuration (options.config)
( function () {
      var 
            file   = options.configFile
          , config = {}
          , settings
          , themesFolder  = options.src + '/'
          ;
    
    if ( !grunt.file.exists(file) ) grunt.fail.fatal('ConfigFile is not set.');

    settings = grunt.file.readJSON ( file , { encoding : 'utf8'} );

    config.themeDefault         = {};
    config.themeDefault.name    = settings.themes.default || false;
    config.themeDefault.folder  = themesFolder + config.themeDefault.name;
    
    if ( !config.themeDefault.name )                      grunt.fail.fatal ('Configuration error: "Theme->default" is not set. Look at ' + configFile);
    if ( !grunt.file.exists(config.themeDefault.folder) ) grunt.fail.fatal ( 'Wrong path to default theme --> ' + config.themeDefault.folder );

    delete settings.themes.default;

    for ( var set in settings) {  config[set] = settings[set]; }

    options.config = config;
})(); // step 1










// STEP 2 - Collect default theme information
( function () {

    var 
            config  = options.config
          , theme   = config.themeDefault.name     //  default theme
          , folder  = config.themeDefault.folder // default theme folder
          , keys    = []
          , content = options.content
          ;

content[theme] = {};

// read files from default theme and define keys
grunt.file.recurse ( folder , function ( abspath, rootdir, subdir, filename ) {
                                              
                                    var 
                                          mainKey      = options.mainKey
                                        , content      = options.content  
                                        , fname
                                        , key
                                        , extension
                                        ;


                                  // filename and extension calculations
                                  fname = getKeyAndExtension ( filename );           
                                  checkPreprocessor ( fname , false );

                                  key       = fname[0];
                                  extension = fname[1];

                                  // if mainKay
                                  if ( key == theme )    key = mainKey;
                                  if ( !keys[key]   ) {
                                                         keys.push ( key );
                                                         keys[ key ] = true;
                                                      }

                                  // extract default theme content
                                  if ( content[theme][key] ) content[theme][key] += grunt.file.read(abspath,{ encoding : 'utf8'});
                                  else                       content[theme][key]  = grunt.file.read(abspath,{ encoding : 'utf8'});

      }); // read folder
      options.keys = keys;
})(); // step 2










// STEP 3 - Read other themes
( function () {
      var
            config       = options.config
          , configFile   = options.configFile
          , themesFolder = options.src + '/'
          , themes       = config.themes
          , themePath
          ;

 for ( var theme in themes ) {

      themePath = themesFolder + themes[theme];

      if ( !grunt.file.exists ( themePath )   )   grunt.fail.fatal ( 'Configuration error. Theme "' + theme + '" folder does not exist. --> ' + configFile );

      grunt.file.recurse ( themePath , function ( abspath, rootdir, subdir, filename ) {
                                                var 
                                                      keys    = options.keys
                                                    , mainKey = options.mainKey  
                                                    , content = options.content
                                                    , themeDefault = options.config.themeDefault.name
                                                    , fname
                                                    , key
                                                    , extension
                                                    ;

                            // filename and extension calculations
                            fname = getKeyAndExtension ( filename );
                            checkPreprocessor ( fname , theme );

                            key       = fname[0];
                            extension = fname[1];

                            // if mainKay
                            if ( key == themeDefault ) key = mainKey;

                            if ( !content[theme] ) content[theme] = {};

                            // Add content if key exists
                            if ( keys[key] ) {
                                                if ( content[theme][key] )  content[theme][key] += grunt.file.read ( abspath, { encoding : 'utf8'});
                                                else                        content[theme][key]  = grunt.file.read ( abspath, { encoding : 'utf8'});
                            }

      }); // file recurse themePath
 } // for theme
})(); // step 3










// STEP 4 - Apply engine. Result - options.saveConfig
( function () {

   // apply fe framework engine as a begining
   /*
      1. Read config
      2. Add missing elements
      3. Prepare save configuration
   */

   var 
          config = options.config
        , themes = config.themes
        , saveConfig = {}
        ;

if ( !themes.mobile    ) themes.mobile    = config.themeDefault.name;
if ( !themes.smart     ) themes.smart     = themes.mobile  || config.themeDefault.name;
if ( !themes.tablet    ) themes.tablet    = config.themeDefault.name;
if ( !themes.desktop   ) themes.desktop   = config.themeDefault.name;
if ( !themes.desktouch ) themes.desktouch = themes.desktop || config.themeDefault.name;

  
saveConfig = {
                 dest  : [ 'mobile', 'smart', 'tablet', 'desktop' , 'desktouch' ]
               , tread : {
                            default : {
                                          content  : {}
                                        , includes : {}
                                        , extras   : {}
                                    } ,
                            mobile  : {
                                          content  : { 
                                                        'default' : [ { mobile : '-'} ]
                                                    }
                                        , includes : { }
                                        , extras   : { }
                                    } ,
                            smart  : {
                                          content  : {}
                                        , includes : {}
                                        , extras   : {}
                                    } ,
                            tablet  : {
                                          content  : {
                                                      inherit   : 'mobile'
                                                      , 'default' : [
                                                                    { mid    : 'mobile-' }
                                                               ]
                                                      , 'en' : [
                                                                  { mid : '-'}
                                                               ]
                                                    }
                                        , includes : {}
                                        , extras   : {}
                                    } ,
                            desktop : {
                                          content  : {
                                                        inherit : 'tablet'
                                                        , 'default' : [
                                                                        { desk   : 'mobile-'}
                                                                    ]
                                                    }
                                        , includes : {}
                                        , extras   : {}
                                    } ,
                         desktouch  : {
                                          content  : {}
                                        , includes : {}
                                        , extras   : {}
                                    }
                       } // tread
} // saveConfig

options.saveConfig = saveConfig;

})(); // step 4









// STEP 5 - Calculate inherit dependencies in saveConfig tread and apply them
(function () {
      var 
            cfg = options.saveConfig.tread
          ;

ids(cfg).forEach ( function ( destination ) { 
                      var 
                            content = cfg[destination]['content']
                          , inherit = content.inherit
                          , heritage
                          ;
if ( inherit ) {
                  delete content.inherit;
                  cfg[destination]['content'] = getHeritage ( inherit ,content, cfg );
              }

}); // cfg each

   options.saveConfig.tread = cfg;

   console.log ( options.saveConfig.tread.desktop.content );

})(); // step 5










// STEP 6 - Write files
( function () {
      var 
            cfg         = options.saveConfig
          , destination = cfg.dest
          // , suffixes    = getSuffixes()
          ;

// foreach destination - create folder, read settings , apply them, save.
destination.forEach ( function ( folder ) {
      var 
            target = options.target
          , keys   = options.keys
          , content = options.content
          , place = target + '/' + folder
          ;

  // prepare destination folders
  grunt.file.mkdir(place);

  keys.forEach ( function ( key ) { 
                                    // console.log(key);
                }); // keys forEach

}); // destination forEach

  // console.log('--------------------');
  // console.log('====================');
  // console.log(options.content['mobile']['main']);

})(); // step 6



















// ---------------------------------------------------------------------------    Helper functions

function ids ( obj ) {
  return Object.getOwnPropertyNames(obj);
}








function getKeyAndExtension ( filename ) {
 // filename and extension calculations
 
         var 
              fname
            , extension
            , key
            ;

  fname     = filename.split('.');
  extension = fname.pop();
  fname     = fname.join();

  // find source key
  key = fname.split('-');

  return [ key[0] , extension ];

} // fileAnalize func.










function checkPreprocessor ( data , theme ) {
// check for preprocessor mishmash.
         var
                preprocessor = options.preprocessor
              , key          = data[0]
              , extension    = data[1]
              , process      = false
              ;

  // Preprocessor type and warning for mishmash
  switch ( extension ) {
              case 'css'  : 
                            process = false;
                            break;
              default     :  
                            process = true;
          } // switch extension;

  if  ( preprocessor[ key ] ) { 
                                if ( process && preprocessor[ key ] == 'css'     )  preprocessor [ key ] = extension;
                                if ( process && preprocessor[ key ] != extension )  grunt.fail.fatal ( 'Preprocessor mishmash in "' + key + '" source key.' ); 
                              }
  else {
                                // add key only if it's coming from theme ( not default )
                                if ( !theme )                                  preprocessor[ key ] = extension;
  }
} // checkPreprocessor func.




function getHeritage ( inherit , content, cfg ) {
              
         var 
                newContent = JSON.parse ( JSON.stringify ( cfg[inherit]['content'] )   )
              , inherit    = newContent.inherit
              ;

if ( inherit ) {
                  delete newContent.inherit;
                  getHeritage ( inherit ,content, cfg );
              }
      
ids(content).forEach ( function ( suffix ) {
                            
                            var tmpContent = {};

// Cancel calculation if newContent has no such suffix
                      if ( !newContent[suffix] ) return;

// clean newContent from same content rules
                      content[suffix].forEach ( function ( part ) {
                            ids(part).forEach ( function ( partName, index ) {
                                                                                tmpContent[partName] = index;
                                });
                                });

                    newContent[suffix].forEach ( function ( part ) {
                             ids(part).forEach( function ( partName, index ) {
                                                                                if ( typeof tmpContent[partName] !== 'undefined' ) newContent[suffix].splice(index,1);
                               });
                               });

// concatinate duplicated content rules
                    content[suffix] = content[suffix].concat(newContent[suffix]);
                    delete newContent[suffix];

}); // each content

ids(newContent).forEach ( function ( suffix ) { 
                      content[suffix] = newContent[suffix];
                      delete newContent[suffix];
                });

return content;

} // getHeritage func.




}); // multiTask layered_themes
}; // module exports


