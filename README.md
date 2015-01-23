# Layered-themes for Grunt

Plugin framework for CSS themes. Theme engines are comming as plugins. Combine with any CSS preprocessor for unlimited power (LESS, SASS, Stylus, Rework, or other).

## Why to use it?
 - Organize CSS rules in small and easy to understand snippets;
 - Try your CSS with different set of variables;
 - Combine snippets for good looking themes;
 - Apply media queries by combining different themes;
 - Change final code without loss of information;
 - Combine with **ANY** preprocessor for pushing boundaries of what is possible to the limit of imagination;



## Welcome Examples
- Chunks: Automatic accumulative prefixes. 'product-header.css' and 'product-footer.css' will provide one result file 'product.css';
- MQ limits: Configuration file has such a snippet:

```json
 "resolution"   : { 
  				    "mobile" : "500" 
  				  , "hq"     : "1000" 
  		       }

```
This code explains that we have 3 optional media queries. From 0 to 500px, from 501 to 1000px, from 1000px to infinity. If your mobile design should be applied up to 700px you can change just mobile border value:

```json
   "resolution" : { 
	  			    "mobile" : "700" 
	  			  , "hq"     : "1000" 
	  		   }
```
- Apply themes: Again from configuration file

```json
 "themes" : { 
	  		    "default" : "desk"
	  		   , "tablet" : "mini"
	  		   , "mobile" : "mini"
  	     } 
```
Code explains that mobile and tablet devices will use same CSS theme - 'mini'. Desktop was not mentioned that's why will use default CSS theme - desk. Framework will create media queries (MQ) for you. From 0 to HQ for 'mini' CSS rules and other from HQ to infinity for desktop rules.




## Installation
Install 'Layered Themes' framework with npm install command:

```
npm install grunt-layered-themes --save-dev
```

'Layered Themes' framework is comming with no engines preinstalled. That's why you should install them by yourself. Write your custom configration* is also an option.

```
npm install layered-themes-3devices --save-dev
```
> Example shows how to install 3devices theme engine. You can select any other engine or write one by yourself. It's easy and the documentation will be provided soon as possible.



Load npm task in 'gruntfile.js':
```js
grunt.loadNpmTasks('grunt-layered-themes');
```

Add grunt configuration lines:
```js
layered_themes : {
                      task : {
                                options : {
                                              configFile : '_config.json'
                                            , src        : 'css-dev'
                                            , target     : 'css'
                                        } ,
                           }
```
 - **src**: your development folder. Contain all CSS theme folders;
 - **target**: framework will write result in this folder
 - **configFile**: path to specific engine configuration file. Engine name, resolutions and theme organization are set into it.

Configuration file is simple 'json' file and here is the minimal content needed:
 
 ```json

{
    "engine"       : "layered_themes_3devices"
  , "resolution"   : { 
	  				    "mobile" : "500" 
	  				  , "hq"     : "1000" 
	  		       }
  , "themes"       : { 
	  				     "default" : "desk"
	  			   }
}
 ```
Engine attribute contains name of the theme engine or link to your custom engine file.
Installation complete!

### Note:

Combining with other CSS post-processes. Using theme engine with CSS preprocessor:
```
css-dev --> tmp-css  ------ o ---------- o ----------------- > css 
                            |            |
                    autoprefixer     CSS preprocessor
```
Set 'target' to temporary place( folder ). Apply autoprefixer or/and preprocessors over the result of theme engine and then save in production folder.


Using just CSS:
```
css-dev --> css
```

If you are using pure CSS you are save to write results directly in production folder.



### More Documentation will be provided soon...





