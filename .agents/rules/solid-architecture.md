---
trigger: always_on
---

# Principes SOLID & Bonnes Pratiques d'Architecture (Expo / React Native)

L'agent DOIT respecter scrupuleusement les 5 principes SOLID lors de toute génération ou modification de code TypeScript et React Native.

---

### S — Single Responsibility Principle (SRP) / Responsabilité Unique
- Chaque fonction, classe, module ou composant React ne doit avoir qu'une seule responsabilité et une seule raison de changer.
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
  return <BudgetSummaryCard loading={isLoading} total={total}/>;
}
```

---

### O — Open/Closed Principle (OCP) / Ouvert/Fermé
- Les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification.
- Préférer la composition, les props polymorphes et l'extensibilité plutôt que de modifier sans cesse des composants ou fonctions existants.
- Utiliser la composition d'éléments (`children`, slots, render props) pour faire évoluer l'UI sans altérer le composant d'origine.

---

### L — Liskov Substitution Principle (LSP) / Substitution de Liskov
- Les sous-classes ou implémentations d'abstractions doivent pouvoir se substituer à leurs types de base sans altérer le comportement attendu.
- Respecter scrupuleusement les contrats d'interfaces et les signatures de types TypeScript.
- Les composants étendant des composants natifs (`PressableProps`, `TextInputProps`) doivent propager et honorer fidèlement leurs props.

---

### I — Interface Segregation Principle (ISP) / Ségrégation des Interfaces
- Concevoir des interfaces et des types TypeScript ciblés et granulaires plutôt que des contrats volumineux.
- Ne pas forcer un composant ou un service à dépendre de propriétés ou méthodes dont il n'a pas besoin.
- Préférer plusieurs interfaces spécifiques combinables (`PropsWithChildren`, petits types d'action) à une méga-interface monolithique.

---

### D — Dependency Inversion Principle (DIP) / Inversion des Dépendances
- Dépendre des abstractions (interfaces / types) plutôt que des implémentations concrètes.
- Isoler les services externes (APIs, SDKs, stockage local) derrière des couches d'abstraction pour faciliter les tests et l'évolutivité.
- Utiliser l'injection via Context React ou des fabriques de services pour découpler les composants des services d'infrastructure.