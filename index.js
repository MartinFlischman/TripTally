// Retrieve necessary elements for manipulation
const expenseForm = document.getElementById("expense-form");
const totalExpensesAmountElement = document.getElementById("total-expenses-amount");
const expenseList = document.getElementById("expense-list");
const modal = document.getElementById("travellers-modal");
const openModalButton = document.getElementById("open-modal-button");
const closeButton = document.querySelector(".close-button");
const travellersForm = document.getElementById("travellers-form");
const travellerNameInput = document.getElementById("traveller-name");
const travellersList = document.getElementById("travellers-list");

// Initialize arrays to store expense and traveller data
let expenses = [];
let travellers = [];

// Event listener to show the modal when the button is clicked
openModalButton.addEventListener("click", function () {
    modal.classList.add("display-modal");
});

// Event listener to hide the modal when the close button is clicked
closeButton.addEventListener("click", function () {
    modal.classList.remove("display-modal");
});

// Event listener to close the modal if clicked outside of it
window.addEventListener("click", function (event) {
    if (event.target === modal) {
    modal.classList.remove("display-modal");
    }
});

// Handle form submission for expenses
expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handleNewExpense();
});

// Handle form submission for adding a new traveller
travellersForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handleNewTraveller();
});

// Function to process a new expense entry and save to Firebase
function handleNewExpense() {
    const category = document.getElementById("expense-category").value;
    const amount = parseInt(document.getElementById("expense-amount").value);
    const newExpenseRef = push(expensesRef);
    set(newExpenseRef, { category, amount }); // Save new expense to Firebase
    expenseForm.reset();
}

// Function to process adding a new traveller and save to Firebase
function handleNewTraveller() {
    const travellerName = travellerNameInput.value.trim();
    if (travellerName !== "") {
    const newTravellerRef = push(travellersRef);
    set(newTravellerRef, { name: travellerName }); // Save new traveller to Firebase
    travellerNameInput.value = "";
    }
}

// Function to remove an expense from Firebase
function deleteExpense(expenseId) {
  remove(ref(database, `expenses/${expenseId}`)); // Remove the expense from Firebase
}

// Function to remove a traveller from Firebase
function removeTraveller(travellerId) {
  remove(ref(database, `travellers/${travellerId}`)); // Remove the traveller from Firebase
}

// Real-time listener for expenses
onValue(expensesRef, (snapshot) => {
    expenses = [];
    snapshot.forEach((childSnapshot) => {
    const expense = childSnapshot.val();
    expense.id = childSnapshot.key; // Store Firebase key as id in expense object
    expenses.push(expense);
    });
    updateDisplays();
});

// Real-time listener for travellers
onValue(travellersRef, (snapshot) => {
    travellers = [];
    snapshot.forEach((childSnapshot) => {
    const traveller = childSnapshot.val();
    traveller.id = childSnapshot.key; // Store Firebase key as id in traveller object
    travellers.push(traveller);
    });
    updateDisplays();
});

// Function to update all relevant displays (expenses and travellers)
function updateDisplays() {
    calculateAmountOwed();
    updateTotalExpensesAmount();
    updateExpenseList();
    updateTravellersList();
}

// Calculate the amount each traveller owes and update their record
function calculateAmountOwed() {
    if (travellers.length === 0) return;
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const amountPerTraveller = (totalExpense / travellers.length).toFixed(2);
    travellers.forEach(traveller => traveller.amountOwed = amountPerTraveller);
}

// Update the total expenses display
function updateTotalExpensesAmount() {
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalExpensesAmountElement.textContent = "R " + totalExpense;
}

// Refresh the list of expenses on the page
function updateExpenseList() {
    expenseList.innerHTML = "";
    expenses.forEach(function (expense) {
    addExpenseToList(expense);
    });
}

// Add a single expense item to the list
function addExpenseToList(expense) {
    const expenseItem = document.createElement("li");
    expenseItem.textContent = expense.category + ": R " + expense.amount;
    const deleteIcon = createDeleteButton(expense.id, deleteExpense);
    expenseItem.appendChild(deleteIcon);
    expenseList.appendChild(expenseItem);
}

// Refresh the list of travellers on the page
function updateTravellersList() {
    travellersList.innerHTML = "";
    travellers.forEach(function (traveller) {
    addTravellerToList(traveller);
    });
}

// Add a single traveller to the list
function addTravellerToList(traveller) {
    const travellerItem = document.createElement("div");
    travellerItem.classList.add("traveller-item");
    travellerItem.textContent = traveller.name + ": R " + traveller.amountOwed;
    const removeButton = createDeleteButton(traveller.id, removeTraveller);
    travellerItem.appendChild(removeButton);
    travellersList.appendChild(travellerItem);
}

// Helper function to create a delete button for both expenses and travellers
function createDeleteButton(id, deleteFunction) {
    const button = document.createElement("button");
    button.innerHTML = "<i class='fas fa-trash-alt'></i>";
    button.addEventListener("click", function () {
    deleteFunction(id);
    });
    return button;
}

// Check if the browser supports service workers
if ('serviceWorker' in navigator) {
  // When the page loads, register the service worker
    window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js') // Register the service worker file
        .then(registration => {
        // If registration is successful, log a message
        console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
        // If registration fails, log an error message
        console.error('Service Worker registration failed:', error);
        });
    });
}
