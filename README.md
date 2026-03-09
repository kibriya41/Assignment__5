# 🚀 JavaScript Modern Essentials

A quick-reference guide for the core pillars of modern JS.

---

### 1️⃣ var, let, and const
| Keyword | Scope | Reassignable | Redeclarable |
| :--- | :--- | :--- | :--- |
| `var` | Function | Yes | Yes |
| `let` | Block `{}` | Yes | No |
| `const` | Block `{}` | No | No |

### 2️⃣ The Spread Operator (`...`)
Used to "unpack" elements from arrays or objects.
* **Copying:** `const clone = [...originalArray];`
* **Merging:** `const combined = { ...obj1, ...obj2 };`

### 3️⃣ map(), filter(), and forEach()
* **`forEach()`**: Executes a function for each element (returns `undefined`).
* **`map()`**: Creates a **new array** by transforming every element.
* **`filter()`**: Creates a **new array** containing only elements that pass a specific condition.



### 4️⃣ Arrow Functions
A concise way to write function expressions.
* **Syntax:** `const greet = (name) => `Hello ${name}`;`
* **Key Detail:** They do not have their own `this` context (lexical scoping).

### 5️⃣ Template Literals
Enhanced strings using backticks (`` ` ``) instead of quotes.
* **Interpolation:** Embed variables directly: `` `Value: ${data}` ``.
* **Multi-line:** Write strings across multiple lines without `\n`.
