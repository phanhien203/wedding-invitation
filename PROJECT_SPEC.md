# Wedding Invitation Website - Project Specification

## Role

You are a Senior Full Stack Developer.

Help me build a complete Online Wedding Invitation Website.

This is a **personal project**, not an enterprise system.

Follow the **KISS principle**.

Keep everything simple, clean, readable, and easy to maintain.

Avoid unnecessary abstractions and over-engineering.

Do not use Clean Architecture with multiple layers.

Use straightforward and practical code.

---

# Tech Stack

## Framework

* Next.js (Latest)
* TypeScript
* Pages Router

## Backend

Use only Next.js API Routes.

No external backend.

No Express.

No NestJS.

---

## Styling

* TailwindCSS

---

## Animation

* Framer Motion

---

## Slider

* Swiper

---

## Icons

* Lucide React

---

## State

* Zustand

---

## Forms

* React Hook Form
* Zod

---

## Utilities

* Axios
* clsx
* dayjs

---

# Folder Structure

Keep the project simple.

Example:

```
src/
│
├── pages/
├── components/
│   ├── common/
│   ├── sections/
│   └── ui/
│
├── layouts/
├── hooks/
├── lib/
├── services/
├── stores/
├── types/
├── utils/
├── styles/
└── constants/

public/
│
├── images/
├── uploads/
├── audio/
└── icons/
```

Avoid unnecessary folders.

---

# Image Upload

Images are stored locally.

Do NOT use:

* AWS S3
* Cloudinary
* Firebase
* Supabase

Store images inside

```
public/uploads
```

Create API Routes for:

* upload image
* delete image

Requirements

* unique filename
* image validation
* max upload size
* only image files

---

# Background Music

Store music inside

```
public/audio
```

Features

* Play
* Pause
* Mute
* Volume
* Loop
* Remember last state with LocalStorage

Create a reusable MusicPlayer component.

---

# Google Maps

Integrate Google Maps.

Requirements

* Wedding venue marker
* Responsive
* Address
* Open Google Maps button
* Latitude / Longitude configurable
* API Key stored in .env

Create reusable Map component.

---

# Responsive

The website must work perfectly on

* Mobile
* Tablet
* Desktop

Mobile First.

---

# Website Sections

## Hero

* Cover Image
* Bride & Groom Name
* Wedding Date
* Scroll Indicator

---

## Couple

* Bride
* Groom
* Short Introduction

---

## Love Story

Timeline with images.

---

## Gallery

Use Swiper.

Support

* Slider
* Lightbox
* Fullscreen Preview

---

## Countdown

Display

* Days
* Hours
* Minutes
* Seconds

---

## Event

Display

* Ceremony
* Reception
* Date
* Time
* Address

---

## Google Map

Embedded map.

---

## Gift

Display

* QR Code
* Bank Information
* Copy Button

---

## RSVP

Simple form

Fields

* Name
* Phone
* Guests
* Attendance
* Message

Submit to API Route.

Store data in JSON file for now.

---

## Wishes

Guest messages.

Newest first.

---

## Footer

* Music Button
* Social Links
* Copyright

---

# Admin

Simple admin page.

No complicated CMS.

Login using a single password stored in environment variables.

Admin can

* upload images
* edit wedding information
* edit gallery
* edit timeline
* edit music
* edit QR code
* manage RSVP
* manage wishes

---

# Coding Style

Keep files small.

Prefer functional components.

Use TypeScript everywhere.

Avoid duplicated code.

Create reusable components.

Use absolute imports.

Use async/await.

Avoid unnecessary comments.

Write self-explanatory code.

---

# UI Style

Elegant

Minimal

Romantic

Modern

Inspired by Korean wedding invitation websites.

Use

* soft colors
* rounded corners
* smooth animation
* generous whitespace

Avoid flashy effects.

---

# Performance

Use

* next/image
* lazy loading
* dynamic import when necessary

Optimize images.

---

# SEO

Support

* Meta Title
* Description
* OpenGraph
* Favicon

---

# Deliverables

Generate the project step by step.

Step 1

Create the folder structure.

Step 2

Install dependencies.

Step 3

Configure Tailwind.

Step 4

Configure TypeScript.

Step 5

Create reusable components.

Step 6

Create layouts.

Step 7

Create pages.

Step 8

Create API Routes.

Step 9

Implement website features.

Step 10

Refactor and optimize.

Do not skip steps.

Wait for confirmation before moving to the next major implementation.
