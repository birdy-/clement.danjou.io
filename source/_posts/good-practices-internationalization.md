---
title: Good practices for internationalization
date: 2016-09-06 20:54:22
tags:
---

Localization is often the third wheel of your application: your product targeted only one country in one language with one currency. It's fine, but it can be a pain in the ass when it comes time to move on.

Internationalization or localization
====================================
It's not always clear what's the difference between localization (l10n) and internationalization (l18n). We call localization the adaptation of text, design, product to a target market. It means translate content, change design, currency, ...
Internationalization is the design and development of features which allow an easy localization: from the use of Unicode, libraries to handle translations or handle currencies, ...
Basically, as a developer, we mainly take care of internationalization to allow others adapt the product to the target market.

Translation is not a "front-end thing"
======================================
Translations are often used at the end: at the end of the project, at the end of the stack, in the front-end. So you discover js file full of translation keys, or worst, translations added manually in a static file. These translation keys are mainly API errors, which are added one by one, because you know, APIs speak english, and only english.
This pattern is not reliable in a long run. You will have to maintain heavy translation file manually: you'll have to add key and worst, remove unused keys. It will be hard to automatize the generation of this file, it would mean call all your APIs with all possible signature. Forget it.
Usually, translations should be handled early. If your API returns an error, translate it. If your API returns pricing, returns the correct currency. You shouldn't make money conversion or translation in front-end.
Front-end will handle his own translations and that's enough.

gettext is (still) cool
=======================
[gettext](https://www.gnu.org/software/gettext/) is old. Almost 30 years. Still, it's a fucking good format to handle translations: it supports context, locales, pluralization, ... Yes, PO/POT file is not sexy, but your JSON format used by only one tool is not also.
The main advantages of po and pot file: it works and it works everywhere. You have Python, Java, PHP, Javascript, ... libraries to write and read them, it's handled by all translation platforms (open-source and SaaS), you have many tools to edit them, and translation companies know how to use it. So why do you want to use a JSON/YAML/XML ?
Maybe you have a good reason, basically, it's easier to read a JSON than a PO in a web app. Since gettext have many tools, you have [a tool](https://www.npmjs.com/package/i18next-conv#i18next-gettext-converter) to convert your PO in a key/value JSON.

article.translation.title.third
===============================
It's crystal clear. No ? Ah you don't see the translation of the title ? Oh... Well, `article.translation.title.third` is not clear indeed. Sorry for this.
You should stick to gettext standard also on keys. Use plain english as key, you have context feature to handle homonyms (ie: the famous `From`). There are some reasons: it will be clearer in code what you express there, it allows easy fallback on english when translation is not available in the targeted language and it's easier to use on SaaS platform and for translation teams.

Automatize everything
=====================
It's not reliable to add/remove manually translations in a POT file. Automatization is really the key. You have tools like [i18next-parser](https://www.npmjs.com/package/i18next-parser) for Javascript or [Babel](https://pypi.python.org/pypi/Babel) in Python to parse your code and extract keys.

I'll write another article to see deeper how to have a correct workflow on translations.
