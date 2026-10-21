/* eslint-disable */
// @ts-nocheck
import { FileRoute, lazyRouteComponent } from '@tanstack/react-router'

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/'
  fileRoutesByTo: FileRoutesByTo
  to: '/'
  id: FileRoutesById
  codeSplitting: boolean
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
}

export const routeTree = rootRoute
  ._addFileRouteChildren(rootRouteChildren)
  ._createFileRouteId()
