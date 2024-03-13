import { createSharedPathnamesNavigation } from 'next-intl/navigation'

export const defaultLocale = 'en'
export const locales = [defaultLocale, 'zh']
export const localePrefix = 'always' // Default

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ localePrefix, locales })
