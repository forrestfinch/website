## Defacto website

The source code for our [website](http://www.defacto.nl). More detailed information can be found at the [Wiki](https://github.com/DefactoSoftware/website/wiki).

##### Server

Start [Middleman](https://middlemanapp.com) server and browse to [http://localhost:4567](http://localhost:4567):


```
./serve
```

##### Build

```
bundle exec middleman build
```

##### Deploy

To [Divshot development](http://development.defacto-website.divshot.io):

```
divshot push
```

To [Divshot production](http://defacto-website.divshot.io):

```
divshot promote development production
```

##### Useful links for debugging

- [http://localhost:4567/__middleman/config/](http://localhost:4567/__middleman/config/)
- [http://localhost:4567/__middleman/sitemap/](http://localhost:4567/__middleman/sitemap/)

##### Dependencies

- Ruby 2.1.0 (install with [rbenv](https://github.com/sstephenson/rbenv))
- Bundler

To install other dependencies run `bundle install` from the root of the project.
