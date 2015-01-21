/*
 * grunt-layered-themes
 * https://github.com/peternaydenov/grunt-layered-themes
 *
 * Copyright (c) 2015 Peter Naydenov
 * Licensed under the MIT license.
 */

'use strict';



module.exports = {



// ---------------------------------------------------------------------------    Helper functions










ids : function ( obj ) {
  return Object.getOwnPropertyNames(obj);
} ,









getKeyAndExtension : function ( filename ) {
 // filename and extension calculations
 
         var 
              fname
            , extension
            , key
            ;


  if ( filename[0] == '.') return false;

  fname     = filename.split('.');
  extension = fname.pop();
  fname     = fname.join();

  // find source key
  key = fname.split('-');

  return [ key[0] , extension ];

} , // fileAnalize func.










checkPreprocessor : function ( data , preprocessor, theme ) {
// check for preprocessor mishmash.
         var
                key          = data[0]
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
                                if ( process && preprocessor[ key ] == 'css'     )  return extension;
                                if ( process && preprocessor[ key ] != extension )  return 'error'; 
                              }
  else {
                                // add key only if it's coming from theme ( not default )
                                if ( !theme || process ) return extension;
                                return false;
  }

} , // checkPreprocessor func.










getHeritage : function ( cfg, destination , type , inherit ) {
              
         var 
                newContent = JSON.parse ( JSON.stringify ( cfg[inherit][type] )   )
              , content    = cfg[destination][type]  
              , inherit    = newContent.inherit
              , ids        = this.ids
              ;

if ( inherit ) {
                  delete newContent.inherit;
                  getHeritage ( inherit , content, cfg );
              }
      
ids(content).forEach ( function ( key ) {

                            var 
                                  tmpContent = {} ; // content value as keys. 

                    // Cancel calculation if newContent has no such key
                    if ( !newContent[key] ) return;


                    // collect all values in reverse object 'tmpContent'
                    content[key].forEach  ( function ( el, index ) {
                                                                         if ( typeof el == 'object')  {
                                                                                                         for ( var sub in el ) {
                                                                                                                        tmpContent[sub]='';
                                                                                                              }
                                                                                                      }
                                                                         else                         tmpContent[el]='';
                                });

                    newContent[key].forEach ( function ( el, index ) {
                                                                         if ( typeof el == 'object')  el = ids(el)[0];
                                                                         if ( typeof tmpContent[el] !== 'undefined' ) newContent[key][index] = null;
                                                                                                                      
                               });
                    // clean empty array members
                    for (var i = 0, length = newContent[key].length; i < length ; i++ ) {
                                                                                           if ( newContent[key][i] === null ) {
                                                                                                                                  newContent[key].splice(i,1);
                                                                                                                                  i--;
                                                                                                                              }
                                                                                        }

                    content[key] = newContent[key].concat ( content[key] );
                    delete newContent[key];

}); // each content

for ( var k in newContent ) {
              content[k] = newContent[k];
              delete newContent[k];
}

return content;

} , // getHeritage func.







inc : function ( extension ) {

    switch ( extension ) {
                          case 'less' : 
                                         return '@import (less) ';
                          case 'scss' : 
                          case 'sass' : 
                          case 'styl' : 
                                         return '@import ';
                          default     :
                                         return '@import ';
          }
} , // inc func.

addIncludes : function ( data , extension ) {

             var 
                    inc = this.inc ( extension )
                  , result = '';

  

    for ( var el in data ) {
                              result += inc + '"' + data[el] + '";\n';
        } // for el

    return result;

} , // addIncludes func.










mq : function ( pack , key , options ) {
      
      var   
            result  = []
          , ids     = this.ids
          , res     = options.config.resolution
          , note    = options.MQcomment
          ;

  pack.forEach ( function ( snippet ) {

                    var 
                          more     = '@media screen and ( min-width: '              
                        , less     = '@media screen and ( max-width: '              
                        , between  = '@media screen and ( max-width: '              
                        , close    = 'px ) {'                                                 
                        , border   = false
                        , interval = '\n\n\n\n\n'
                        , name
                        , content
                        , mq , min , max , t , noteType
                        ;
            
            name = ids(snippet)[0];
            noteType = snippet[name];



            mq = snippet[name].split('-');
            min = ( mq[0]=='' ) ? false : res[ mq[0] ];
            max = ( mq[1]=='' ) ? false : res[ mq[1] ];

            if (  min && !max )  border = more + ( parseInt(min)+1 )                                 + close;
            if ( !min &&  max )  border = less + ( parseInt(max)   )                                 + close;
            if (  min &&  max )  border = more + ( parseInt(min)+1 ) +'px ) and ( max-width: ' + max + close;

            if (  note [ noteType ]   )  {
                                                  result.push ( interval + '// *** ' + note[ snippet[name] ]   );
                                                  interval = '';
                                              }
            else                              {
                                                note[ snippet[name] ] = '';
                                              }

            if ( border ) {
                             result.push ( interval + border );
                             result.push ( options.content[name][key] );
                             result.push ('} // mq ' + note[ snippet[name] ] );
                          }
            else             result.push ( options.content[name][key] );
            }); // each item
 
 return result;

 } // mq func.





 
}; // module exports




