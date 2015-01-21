/*
 * grunt-layered-themes
 * https://github.com/peternaydenov/grunt-layered-themes
 *
 * Copyright (c) 2015 Peter Naydenov
 * Licensed under the MIT license.
 */

'use strict';
 var 
        f    = require('./helpers.js')
      , path = require ('path')
      ;

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('layered_themes', 'Plugin framework for CSS themes.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options ({
                                  config       : {}  // config file data
                                , content      : {}  // file content data structure
                                , keys         : []
                                , preprocessor : {}
                                , saveConfig   : {}  // engine result is configuration for saving.
                                , MQcomment    : {}  // MQ comments (optional). Placed on top of MQ
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
          , themesFolder  = options.src + path.sep
          ;
    
    if ( !grunt.file.exists(file) )   grunt.fail.fatal ( 'ConfigFile is not set.' );
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










// STEP 2 - Apply engine. Result - options.saveConfig
( function () {

   /*
      1. Read config
      2. Add missing elements
      3. Prepare save configuration
   */

  var engine = require ( options.config.engine );
  
  engine.start ( options );

})(); // step 2










// STEP 3 - Collect default theme information
( function () {

    var 
            config       = options.config
          , themeDefault = config.themeDefault.name     //  default theme
          , folder       = config.themeDefault.folder   // default theme folder
          , keys         = []
          , content      = options.content
          , defaultName  = 'default'
          ;

// TODO : fix this. We have mix of names and devices;
content[defaultName] = {};

// read files from default theme and define keys
grunt.file.recurse ( folder , function ( abspath, rootdir, subdir, filename ) {
                                              
                                    var 
                                          mainKey      = options.mainKey
                                        , content      = options.content
                                        , preprocessor = options.preprocessor 
                                        , fname
                                        , key
                                        , extension
                                        ;

                                  // filename and extension calculations
                                  fname = f.getKeyAndExtension ( filename );
                                  if ( !fname ) return;
                                  if ( fname[0] == themeDefault )    fname[0] = mainKey;

                                  extension = f.checkPreprocessor  ( fname , preprocessor, false );
                                  key = fname[0];

                                  if ( !keys[key]   ) {
                                                         keys.push ( key );
                                                         keys[ key ] = true;
                                                      }



                                  // extract default theme content
                                  if ( content[defaultName][key] )  content[defaultName][key]  += grunt.file.read ( abspath, { encoding : 'utf8'} );
                                  else                              content[defaultName][key]   = grunt.file.read ( abspath, { encoding : 'utf8'} );

                                  if ( extension ) preprocessor[key] = extension;
      }); // read folder
      options.keys = keys;
})(); // step 3










// STEP 4 - Read other themes
( function () {
      var
            config       = options.config
          , configFile   = options.configFile
          , preprocessor = options.preprocessor
          , themesFolder = options.src + path.sep
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
                            fname     = f.getKeyAndExtension ( filename );
                            if ( fname[0] == themeDefault ) fname[0] = mainKey;

                            extension = f.checkPreprocessor  ( fname , preprocessor, theme );
                            if ( extension == 'error' ) grunt.fail.fatal ( 'Preprocessor mishmash in "' + key + '" source key.' );
                            key = fname[0];

                            if ( !content[theme] ) content[theme] = {};

                            // Add content if key exists
                            if ( keys[key] ) {
                                                if ( content[theme][key] ) content[theme][key] += grunt.file.read ( abspath, { encoding : 'utf8'});
                                                else                       content[theme][key]  = grunt.file.read ( abspath, { encoding : 'utf8'});
                            }

                            if ( extension ) preprocessor[key] = extension;

      }); // file recurse themePath
 } // for theme
})(); // step 4










// STEP 5 - Calculate inherit dependencies in saveConfig and apply them
( function () {
                var 
                        cfg  = options.saveConfig
                      , dest = f.ids(cfg)
                      ;



function findComma ( type , destination ) {
                var el = cfg[destination][type];

          f.ids ( el ).forEach ( function ( suffix ) {
                                          var   
                                                comma = new RegExp ( ',' )
                                              , split
                                              ;

                                // act on comma separated suffixes
                                if ( comma.test (suffix) ) {
                                                               split = suffix.split(',');
                                                               // add/update suffixes and remove combined ones
                                                               split.forEach ( function ( checkup ) { 
                                                                                                        if ( el[checkup] ) el[checkup] = el[checkup].concat ( el[suffix] );
                                                                                                        else                    el[checkup] = el[suffix];
                                                                                         });
                                                               delete el[suffix];
                                                            } // if comma
                         }); // each type
} // findComma func.

dest.forEach ( function ( destination ) {
                                          // split comma separated suffixes if any.
                                          findComma ( 'content' , destination );
                                          findComma ( 'include' , destination );
                                          findComma ( 'extra'   , destination );
              }); // forEach destination



dest.forEach ( function ( destination ) {
// inheritance calculation
                      var 
                            content = cfg[destination]['content']
                          , extra   = cfg[destination]['extra']
                          , include = cfg[destination]['include']
                          , inherit
                          ;

              if ( content.inherit ) {
                                        inherit = content.inherit;
                                        delete    content.inherit;
                                        cfg[destination]['content'] = f.getHeritage ( cfg , destination , 'content', inherit );
                                     }

              if ( extra.inherit )   {
                                        inherit = extra.inherit;
                                        delete    extra.inherit;
                                        cfg[destination]['extra']   = f.getHeritage ( cfg , destination , 'extra'  ,  inherit );
                                     }

              if ( include.inherit ) {
                                        inherit = include.inherit;
                                        delete    include.inherit;
                                        cfg[destination]['include'] = f.getHeritage ( cfg , destination , 'include' , inherit );
                                     }

}); // each destination ( inheritance cycle )




dest.forEach ( function ( destination ) {
// preprocessor mishmash check. Compare extensions of include and extra files with content.
                      var 
                            preprocessor = options.preprocessor
                          , extra        = cfg[destination]['extra']
                          , include      = cfg[destination]['include']
                          , ids          = f.ids
                          , change       = false   // preprocessor change on adding includes
                          , split
                          , extension
                          , buffer
                          ;



      for ( var suffix in include         ) {
      for ( var el     in include[suffix] ) {
                        split = include[suffix][el].split('.');
                        extension = split[ split.length-1 ];

                        if ( 'css' != extension ) {
                                                      for ( var key in preprocessor ) {
                                                                          if ( 'css' != preprocessor[key] ) {
                                                                                                                if ( preprocessor[key] != extension ) grunt.fail.fatal ( 'Preprocessor mishmash - ' + extension + ' and ' + preprocessor[key] + '. Check "' + destination + '" include. Suffix "' + suffix + '".' ); 
                                                                                                            }
                                                                          else                              {
                                                                                                                preprocessor[key] = extension;
                                                                                                                change = true;
                                                                                                            }
                                                          }
                                                  }
      }} // for suffix-el in include



      for ( var key in extra     ) {
      for ( var el in extra[key] ) {
                        split = extra[key][el].split('.');
                        extension = split[ split.length-1 ];
                        if ( 'css' != extension ) {
                                                    if ( 'css' != preprocessor[key] ) {
                                                                                          if ( preprocessor[key] != extension ) {
                                                                                                                                  if ( change )   grunt.fail.fatal ( 'Preprocessor mishmash - ' + extension + ' and ' + preprocessor[key] + '. Checkout "' + destination + '" extra and include files.' ); 
                                                                                                                                  else            grunt.fail.fatal ( 'Preprocessor mishmash - ' + extension + ' and ' + preprocessor[key] + '. Checkout "' + destination + '" extra key "' + key + '" or inheritance chain.' ); 
                                                                                                                                }
                                                                                      }
                                                    else                              {
                                                                                          preprocessor[key] = extension;
                                                                                      }
                                                  }
      }} // for key-el in extra


}); // each destination ( preprocessor check )



dest.forEach ( function ( destination ) {
// includes - Use the default setting, if not specifically described
                var 
                        content = options.saveConfig[destination]['content']
                      , include = options.saveConfig[destination]['include'];

for ( var suffix in content ) {
        if ( 'default' != suffix ) {
                                      if ( !include[suffix] ) include[suffix] = include['default'];
                                   }
} // each suffix
}); // each destination (missing includes)



   delete cfg.default;
   options.saveConfig = cfg;

})(); // step 5










// STEP 6 - Write files
( function () {
      var 
            cfg         = options.config
          , keys        = options.keys
          , content     = options.content
          , i           = 0
          , destination = f.ids(options.saveConfig)
          , saveContent = {}
          // , folder      = 'desktop'
          ;


// remove 'default' if there is target folder
for ( var t in content ) {
                            i ++;
                            if ( i > 1 ) break; 
                         }
if ( i > 1 ) delete content.default;



destination.forEach ( function ( folder ) {
       keys.forEach ( function ( key ) {
               var
                       cfg          = options.saveConfig
                     , content      = options.content
                     , preprocessor = options.preprocessor
                     , saveContent  = []
                     , ids          = f.ids
                     , fileName
                     , extension
                     , place
                     ;

      extension = preprocessor[key];

      for ( var suffix in cfg[folder]['content'] ) {


                // create filename and extension
                extension = preprocessor[key];
                if ( suffix == 'default' ) fileName = key +                '.' + extension;
                else                       fileName = key + '_' + suffix + '.' + extension;

                // Add Content to saveContent
                saveContent = f.mq ( cfg[folder]['content'][suffix], key , options );

                // Add Include to saveContent
                if ( cfg[folder]['include'][suffix] ) saveContent.unshift ( f.addIncludes ( cfg[folder]['include'][suffix], extension )  );

                // Add Extra to SaveContent
                if ( cfg[folder]['extra'][key] )      saveContent.unshift ( f.addIncludes ( cfg[folder]['extra'][key],      extension )  );

                place = options.target + path.sep + folder + path.sep + fileName
                grunt.file.write ( place , saveContent.join('\n'), { encoding : 'utf8' } );
                grunt.log.ok ('File "' + place + '" was saved.');

              } // for suffix

}); }); //  forEach folder-key

})(); // step 6 - write files





}); // multiTask layered_themes
}; // module exports




