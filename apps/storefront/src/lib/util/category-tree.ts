import { HttpTypes } from "@medusajs/types"

export type CategoryNode = {
  id: string
  handle: string
  name: string
  children: CategoryNode[]
}

const byRank = (a: HttpTypes.StoreProductCategory, b: HttpTypes.StoreProductCategory) =>
  (a.rank ?? 0) - (b.rank ?? 0) || a.name.localeCompare(b.name)

/**
 * Builds the category tree from the flat list. Children are looked up in the
 * list itself rather than read from `category_children`, so their names come
 * translated like every other category.
 */
export const buildCategoryTree = (
  categories: HttpTypes.StoreProductCategory[]
): CategoryNode[] => {
  const toNode = (category: HttpTypes.StoreProductCategory): CategoryNode => ({
    id: category.id,
    handle: category.handle,
    name: category.name,
    children: categories
      .filter((c) => c.parent_category_id === category.id)
      .sort(byRank)
      .map(toNode),
  })

  return categories
    .filter((c) => !c.parent_category_id)
    .sort(byRank)
    .map(toNode)
}

/** Handles of a category and all its ancestors, to highlight the active path. */
export const activeHandles = (
  tree: CategoryNode[],
  handle?: string
): Set<string> => {
  const path = (nodes: CategoryNode[]): string[] | null => {
    for (const node of nodes) {
      if (node.handle === handle) {
        return [node.handle]
      }
      const sub = path(node.children)
      if (sub) {
        return [node.handle, ...sub]
      }
    }
    return null
  }

  return new Set(handle ? path(tree) ?? [] : [])
}
