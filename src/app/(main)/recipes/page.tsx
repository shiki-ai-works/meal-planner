import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { DbInventory, DbRecipe } from '@/types/database'
import { RecipesClient } from './RecipesClient'

export default async function RecipesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [recipesRes, inventoryRes] = await Promise.all([
    supabase.from('recipes').select('*'),
    supabase.from('inventory').select('ingredient_name').eq('user_id', user.id),
  ])

  const recipes = ((recipesRes.data ?? []) as DbRecipe[]).sort((a, b) =>
    a.name.localeCompare(b.name, 'ja'),
  )
  const inventory = (inventoryRes.data ?? []) as Pick<
    DbInventory,
    'ingredient_name'
  >[]
  const inventoryNames = inventory.map((item) => item.ingredient_name)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">レシピ図鑑</h1>
          <p className="mt-1 text-xs text-muted">
            料理名、食材、タグから献立候補を探せます。
          </p>
        </div>
        <div className="text-right text-xs text-muted">
          <div>登録</div>
          <div>
            <span className="font-mono text-foreground">{recipes.length}</span> 件
          </div>
        </div>
      </header>

      <RecipesClient recipes={recipes} inventoryNames={inventoryNames} />
    </div>
  )
}
