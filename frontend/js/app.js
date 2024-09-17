// On window load, fetch dynamic data for the pie chart and stock items
window.onload = function() {
  fetchOrderStatuses(); // Fetch dynamic order statuses
  fetchStockItems(); // Fetch stock items on page load
};

// Fetch dynamic order statuses from the backend and populate the pie chart
function fetchOrderStatuses() {
  fetch('/api/orders/status')
    .then(response => response.json())
    .then(statusData => {
      const ctx = document.getElementById('orderChart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Pending', 'In Queue', 'Processed', 'Completed'],
          datasets: [{
            label: 'Order Status',
            data: [statusData.pending, statusData.inQueue, statusData.processed, statusData.completed],
            backgroundColor: ['red', 'blue', 'orange', 'green'],
          }]
        }
      });
    })
    .catch(error => console.error('Error fetching order statuses:', error));
}

// Functions for opening and closing stock form popup
function openStockForm() {
  document.getElementById('stockForm').style.display = 'block';
}

function closeStockForm() {
  document.getElementById('stockForm').style.display = 'none';
}

// Open the new order modal and fetch stock items
function openOrderForm() {
  document.getElementById('newOrderModal').style.display = 'block';
  fetchStockItems();
}

// Close the new order modal
function closeOrderForm() {
  document.getElementById('newOrderModal').style.display = 'none';
}

// Fetch stock items from the backend and populate the dropdown
function fetchStockItems() {
  fetch('/api/products')
    .then(response => response.json())
    .then(data => {
      stockItems = data;
      loadStockItems();
      loadStockGrid();
    })
    .catch(error => console.error('Error fetching stock items:', error));
}

// Populate stock items into the dropdown
function loadStockItems() {
  const itemSelect = document.getElementById('itemSelect');
  itemSelect.innerHTML = '<option value="" disabled selected>Pick Item</option>';

  stockItems.forEach(item => {
    const option = document.createElement('option');
    option.value = item._id;
    option.textContent = `${item.name} ($${item.price})`;
    itemSelect.appendChild(option);
  });

  updateTotalPrice(); // Initialize price calculation
}

// Calculate total price based on selected item and quantity
function updateTotalPrice() {
  const selectedItemId = document.getElementById('itemSelect').value;
  const selectedItem = stockItems.find(item => item._id === selectedItemId);
  const quantity = parseInt(document.getElementById('itemQuantity').value, 10);
  const totalPrice = selectedItem ? selectedItem.price * quantity : 0;
  document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
}

// Create a new order and save it to the backend
function createOrder(event) {
  event.preventDefault();

  const customerName = document.getElementById('customerName').value.trim();
  const selectedItemId = document.getElementById('itemSelect').value;
  const selectedItem = stockItems.find(item => item._id === selectedItemId);
  const quantity = parseInt(document.getElementById('itemQuantity').value, 10);
  const totalPrice = document.getElementById('totalPrice').textContent;

  if (!customerName || !selectedItem || isNaN(quantity) || quantity <= 0) {
    alert('Please fill in all required fields and provide a valid quantity.');
    return;
  }

  const newOrder = {
    id: `ORD${Date.now()}`, // Unique ID
    customer: customerName,
    item: selectedItem.name,
    quantity: quantity,
    totalPrice: totalPrice,
    dateCreated: new Date().toLocaleDateString(),
    status: 'Pending'
  };

  fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newOrder)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(order => {
      orders.push(order);
      updateOrdersTable();
      closeOrderForm();
    })
    .catch(error => {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    });
}

// Update the orders table
function updateOrdersTable() {
  const ordersTableBody = document.getElementById('ordersTableBody');
  ordersTableBody.innerHTML = '';

  orders.forEach(order => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.customer}</td>
      <td>${order.item} x${order.quantity}</td>
      <td>$${order.totalPrice}</td>
      <td>${order.dateCreated}</td>
      <td>${order.status}</td>
    `;
    row.onclick = () => openOrderPopup(order);
    ordersTableBody.appendChild(row);
  });
}

// Show order details popup
function openOrderPopup(order) {
  document.getElementById('orderDetails').textContent = `
    Order ID: ${order.id}
    Customer: ${order.customer}
    Item: ${order.item} x${order.quantity}
    Total Price: $${order.totalPrice}
  `;
  document.getElementById('orderPopup').style.display = 'block';
}

// Close the popup
function closePopup() {
  document.getElementById('orderPopup').style.display = 'none';
}

// Sidebar toggle functionality
function openNav() {
  document.getElementById('sidebar').style.width = '250px';
}

function closeNav() {
  document.getElementById('sidebar').style.width = '0';
}

// Fetch order details and create an invoice
function createInvoice() {
  const orderID = document.getElementById('orderID').value.trim();

  if (!orderID) {
    alert('Please enter an Order ID');
    return;
  }

  fetch(`/api/orders/${orderID}`)
    .then(response => response.json())
    .then(order => {
      populateInvoiceTemplate(order);
      closeInvoiceModal();
    })
    .catch(err => {
      console.error('Error fetching order for invoice:', err);
      alert('Failed to fetch order details. Please try again.');
    });
}

// Populate invoice template with order details
function populateInvoiceTemplate(orderDetails) {
  document.querySelector('.invoice-table tbody').innerHTML = orderDetails.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.price}</td>
    </tr>
  `).join('');

  document.querySelector('.invoice-container h3:last-of-type').innerText = `Total Price: Ksh ${orderDetails.totalPrice}`;
}

// Show the invoice modal
function showInvoiceModal() {
  document.getElementById('invoiceModal').style.display = 'block';
}

// Close the invoice modal
function closeInvoiceModal() {
  document.getElementById('invoiceModal').style.display = 'none';
}

// Add a new stock item to the backend and frontend grid
function addStockItem() {
  const name = document.getElementById('stockName').value.trim();
  const description = document.getElementById('stockDescription').value.trim();
  const price = parseFloat(document.getElementById('stockPrice').value.trim());
  const quantity = parseInt(document.getElementById('stockQuantity').value.trim(), 10);
  const imageUrl = document.getElementById('stockImage').value.trim() || 'path/to/placeholder-image.png';
  let category = document.getElementById('stockCategory').value.trim();

  if (category === 'AddNew') {
    category = document.getElementById('newCategory').value.trim();
  }

  // Validate fields
  if (!name || !description || isNaN(price) || isNaN(quantity) || !category) {
    alert('Please fill in all required fields with valid values.');
    return;
  }

  const newStockItem = { name, description, price, quantity, imageUrl, category };

  fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newStockItem)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(item => {
      addStockItemToGrid(item);
      closeStockForm();
    })
    .catch(error => {
      console.error('Error adding stock item:', error);
      alert('Failed to add stock item. Please try again.');
    });
}

// Add a stock item to the grid
function addStockItemToGrid(item) {
  const stockGrid = document.getElementById('stockGrid');
  const stockItem = document.createElement('div');
  stockItem.classList.add('stock-item');

  stockItem.innerHTML = `
    <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='path/to/placeholder-image.png';" />
    <h3>${item.name}</h3>
    <p>${item.description}</p>
    <p class="price">Price: KSh ${item.price}</p>
    <p class="quantity">Quantity: ${item.quantity}</p>
    <p class="category">Category: ${item.category}</p>
  `;

  stockGrid.appendChild(stockItem);
}

// Load stock items into the grid
function loadStockGrid() {
  const stockGrid = document.getElementById('stockGrid');
  stockGrid.innerHTML = '';

  stockItems.forEach(item => {
    addStockItemToGrid(item);
  });
}

// Show or hide the new category input
function checkNewCategory(selectElement) {
  const newCategoryDiv = document.getElementById('newCategoryInput');
  newCategoryDiv.style.display = selectElement.value === 'AddNew' ? 'block' : 'none';
}
// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault(); // Prevent default form submission

  // Get the username and password values
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');

  // Send login request to the backend
  fetch('/api/login', { // Ensure this endpoint matches your backend login route
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      return response.json(); // Parse JSON response
    })
    .then(data => {
      if (data.redirect) {
        window.location.href = data.redirect; // Redirect to index.html
      }
    })
    .catch(error => {
      console.error('Error during login:', error);
      alert('Failed to login. Please check the console for more details.');
    });
});

