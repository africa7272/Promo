---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: false
description: "Статьи по тегу {{ .Name }}"
---

# {{ replace .Name "-" " " | title }}

Здесь собраны все статьи по тегу **{{ .Name }}**.
