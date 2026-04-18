let lastQuery = "";

// handle search
function handleSearch() {
  const query = document.getElementById("input").value.trim().toLowerCase();
  if (!query) return alert("Enter food name");

  lastQuery = query;
  searchFood(query);
}

// enter key support
document.getElementById("input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

// search meals
async function searchFood(query) {
  const resultsDiv = document.getElementById("results");
  
  // Turn Grid layout ON for search results
  resultsDiv.style.display = "grid"; 
  resultsDiv.innerHTML = `<p class="loading">Searching...</p>`;

  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
    );

    const data = await res.json();

    if (!data.meals) {
      // Prevent grid from shrinking the "no results" message
      resultsDiv.style.display = "block"; 
      resultsDiv.innerHTML = `<p style="text-align:center;">No results found</p>`;
      return;
    }

    resultsDiv.innerHTML = "";

    data.meals.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${item.strMealThumb}" alt="${item.strMeal}">
        <h3>${item.strMeal}</h3>
        <button onclick="getDetails('${item.idMeal}')">View Recipe</button>
      `;

      resultsDiv.appendChild(card);
    });

  } catch (err) {
    resultsDiv.style.display = "block";
    resultsDiv.innerHTML = `<p style="text-align:center;">Error loading data</p>`;
    console.error(err);
  }
}

// get details
async function getDetails(id) {
  const resultsDiv = document.getElementById("results");
  
  // Turn Grid layout OFF so the recipe takes up the full width properly
  resultsDiv.style.display = "block"; 
  resultsDiv.innerHTML = `<p class="loading">Loading recipe...</p>`;

  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );

    const data = await res.json();
    const meal = data.meals[0];

    // ingredients extraction
    let ingredients = "";

    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (ing && ing.trim() !== "") {
        ingredients += `<li>${ing} - ${measure}</li>`;
      }
    }

    resultsDiv.innerHTML = `
      <div class="recipe-container">

        <div class="recipe-left">
          <h2>${meal.strMeal}</h2>
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        </div>

        <div class="recipe-content-area">
          <div class="recipe-mid">
            <h3>Ingredients</h3>
            <ul>${ingredients}</ul>
          </div>

          <div class="recipe-right">
            <h3>Instructions</h3>
            <p style="white-space: pre-line;">${meal.strInstructions}</p>
          </div>
        </div>

      </div>

      <div class="back-container">
        <button class="back-btn" onclick="searchFood('${lastQuery}')">← Back to Search</button>
      </div>
    `;

  } catch (err) {
    resultsDiv.innerHTML = `<p style="text-align:center;">Error loading recipe</p>`;
    console.error(err);
  }
}