---
trigger: always_on
---

# Principes SOLID & Bonnes Pratiques d'Architecture (Expo / React Native)

L'agent DOIT respecter scrupuleusement les 5 principes SOLID lors de toute génération ou modification de code TypeScript et React Native.

---

### S — Single Responsibility Principle (Responsabilité Unique)
- Un composant UI ne gère **jamais** la logique métier ni les appels réseau en direct.
- Séparer strictement :
  1. **Composants d'affichage (Présentation)** : Purs, recevant des props simples.
  2. **Custom Hooks (Logique Métier & État)** : Gestion du state, calculs de solde, filtres de date.
  3. **Services / API** : Appels réseau purs, stockage local (`AsyncStorage` / `SecureStore`).

*Exemple :*
```typescript
// ❌ MAUVAIS : Le composant gère l'UI, le fetch et le calcul
export function BudgetSummary() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/budget').then(...) }, []);
  const total = data.reduce(...);
  return <View>...</View>;
}

// ✅ BON : Découpage clair
export function BudgetSummary() {
  const { total, isLoading } = useBudgetSummary(); // Hook dédié
  return <BudgetSummaryCard loading="{isLoading}" total="{total}"/>;
}