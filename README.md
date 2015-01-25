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
Install 'Layered Themes' framework:

```
npm install grunt-layered-themes --save-dev
```

'Layered Themes' framework is coming with no engines preinstalled. Install them or write your custom configration*.

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




## How it works?
1. Read settings from configuration file(_config.json) and prepare the framework configuration;
2. Start the engine. Engine prepares list of rules related to result files (content, media queries, folders). This set of rules is named 'save matrix';
3. Collect content from default theme. Apply key-concatinaion in default theme content. Fulfil 'content keys' table.
4. Collect content from other themes according 'content keys' table. Themes that are not in use are completly ignored;
5. Normalize 'save matrix' for computer use;
6. Save files according rules provided by 'save matrix';




## Dictionary
- **Content Key/Key**: Filename or file prefix. Keys are simpliest instruction for file concatinination inside the theme. Content keys from default theme form 'content key table'. Other theme keys that are not in 'content key table' will be ignored.
```
      filename.css          file-name.css           file-header.css    file.css
          |                   |                       |                  |
      key 'filename'       key 'file'                key 'file'        key 'file'
```
Filename will be filename in result folder. 'file.css' will combine content of file.css,file-name.css,file-header.css;

- **Suffix**: Option to organize content from same key on different way. Include different variables and libraries or set different media queries. Suffixes are controlled by save matrix object.

- **Theme** : Full set of CSS files closed in one folder. Name of the theme is name of the folder. All themes are subfolders of 'src' folder;
 
- **Save Matrix** : Set of rules about combining content, media queries and folders. Save matrix is coming as a result of theme engine;

- **Theme engine**: Algorithm that provide as a result 'save matrix'. The simplest engine is just manual edit of 'save matrix';

- **Slave Themes**: All theme names used in congiguration that are not used as theme default.
- **MainKey**: Internal framework mechanism provides auto renaming of mainKey. MainKey is content key with name of the theme. Default renaming is set to 'main'. Example:

```
 |-desk|
 |     |-contact.css
 |     |-product.css
 |     |-desk-header.css
 |     |-mini-slave.css
 |
 |-mini|
       |-desk-slave.css
       |-mini-all.css

```

If theme 'desk' is set as default:

- 'desk' content key (desk-header.css) will become 'main' content key. 
- Theme 'mini' is slave theme and will convert 'desk' content key(desk-slave.css) as 'main'.

If theme 'mini' is set as default:

- 'mini' content key (mini-all.css) will become 'main' content key.
- Theme 'desk' is slave theme and will transform 'mini' key(mini-slave.css) as 'main'.



MainKey is an abstraction level that provides option combine themes as default or slaves without heavy refactoring process. It's also provides a visual clue how themes are connected.

## Read More

- [Configuration file](https://github.com/PeterNaydenov/grunt-layered-themes/wiki/1.-Configuration-File)
- [SaveMatrix](https://github.com/PeterNaydenov/grunt-layered-themes/wiki/2.-Save-Matrix)
- [Good Practices](https://github.com/PeterNaydenov/grunt-layered-themes/wiki/3.-Good-Practices)
- [Create Custom Theme Engine](https://github.com/PeterNaydenov/grunt-layered-themes/wiki/4.-Create-Custom-Theme-Engine)
- [Combine with Other CSS Processing](https://github.com/PeterNaydenov/grunt-layered-themes/wiki/5.-Combine-with-Other-CSS-Processing.)


## Release History

### 0.1.4 (2015-01-25)

 - [x] Documentation improvement;
 - [x] Configuration access to 'mainKey';


### More Documentation will be provided soon...





