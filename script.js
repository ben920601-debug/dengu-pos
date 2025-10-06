// 商品資料（加入群組）
const products = [
  { name: '可樂', price: 30, group: '飲料' },
  { name: '雪碧', price: 30, group: '飲料' },
  { name: '洋芋片', price: 50, group: '零食' },
  { name: '巧克力', price: 40, group: '零食' },
  { name: '三明治', price: 60, group: '主食' },
  { name: '飯糰', price: 55, group: '主食' }
];

// 取得所有群組
const groups = [...new Set(products.map(p => p.group))];


// 渲染群組選單
function renderGroupSelect() {
  const select = document.getElementById('groupSelect');
  select.innerHTML = groups.map(g => `<option value="${g}">${g}</option>`).join('');
  select.addEventListener('change', renderProducts);
}

// 渲染商品列表（依群組）
function renderProducts() {
  const productsDiv = document.getElementById('products');
  const select = document.getElementById('groupSelect');
  const currentGroup = select ? select.value : groups[0];
  productsDiv.innerHTML = '';
  products
    .filter(p => p.group === currentGroup)
    .forEach((p, idx) => {
      productsDiv.innerHTML += `
        <div class="item-row" style="cursor:pointer;" onclick="addToCart(${products.findIndex(prod => prod.name === p.name)})">
          <div class="item-name">${p.name} ($${p.price})</div>
        </div>
      `;
    });
}

// 購物車資料
let cart = [];

// 渲染購物車
function renderCart() {
  const cartDiv = document.getElementById('cart');
  cartDiv.innerHTML = '';
  if (cart.length === 0) {
    cartDiv.innerHTML = '<div>購物車是空的</div>';
    updateTotal();
    return;
  }
  cart.forEach((item, idx) => {
    cartDiv.innerHTML += `
      <div class="cart-row">
        <div class="cart-name">${item.name} ($${item.price})</div>
        <div class="cart-controls">
          <button onclick="changeQty(${idx}, -1)">-</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${idx}, 1)">+</button>
          <button onclick="removeFromCart(${idx})">移除</button>
        </div>
      </div>
    `;
  });
  updateTotal();
}

// 加入商品到購物車
function addToCart(idx) {
  const prod = products[idx];
  const found = cart.find(item => item.name === prod.name);
  if (found) {
    found.qty += 1;
  } else {
    cart.push({ ...prod, qty: 1 });
  }
  renderCart();
}

// 修改商品數量
function changeQty(idx, delta) {
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  renderCart();
}

// 從購物車移除商品
function removeFromCart(idx) {
  cart.splice(idx, 1);
  renderCart();
}

// 更新總金額顯示
function updateTotal() {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById('total').textContent = `總金額：$${total}`;
  updateChange();
}

// 更新找零顯示
function updateChange() {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cash = Number(document.getElementById('cashInput').value) || 0;
  let changeText = '';
  if (cash >= total && total > 0) {
    changeText = `找零：$${cash - total}`;
  } else {
    changeText = '找零：$0';
  }
  document.getElementById('change').textContent = changeText;
  document.getElementById('cashError').textContent = '';
  document.addEventListener('DOMContentLoaded', () => {
  const cashInput = document.getElementById('cashInput');
  if (cashInput) {
    cashInput.addEventListener('input', updateChange);
  }
  });
}

// 結帳功能
function checkout() {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cash = Number(document.getElementById('cashInput').value) || 0;
  if (total === 0) {
    alert('購物車是空的');
    return;
  }
  if (cash < total) {
    document.getElementById('cashError').textContent = '金額不足，無法結帳';
    return;
  }

  // 產生明細內容
  let receipt = `
    <h2 class="print-receipt-title">結帳明細</h2>
    <table class="print-receipt-table">
      <tr>
        <th>品項</th>
        <th>單價</th>
        <th>數量</th>
        <th>小計</th>
      </tr>`;
  cart.forEach(item => {
    receipt += `<tr>
      <td>${item.name}</td>
      <td>$${item.price}</td>
      <td>${item.qty}</td>
      <td>$${item.price * item.qty}</td>
    </tr>`;
  });
  receipt += `</table>
    <div style="margin-top:16px;font-weight:bold;">總金額：$${total}</div>
    <div style="margin-top:16px;">感謝您的購買！</div>`;

  // 跳出新視窗顯示明細，連接 style.css
  const printWin = window.open('', '', 'width=400,height=600');
  printWin.document.write(`
    <html>
      <head>
        <title>列印明細</title>
        <link rel="stylesheet" href="style.css">
      </head>
      <body class="print-receipt-body">
        ${receipt}
        <script>
          window.onload = function() { window.print(); }
        <\/script>
      </body>
    </html>
  `);
  printWin.document.close();

  alert(`結帳成功！總金額：$${total}\n找零：$${cash - total}`);
  cart = [];
  document.getElementById('cashInput').value = '';
  renderCart();
  updateChange();
}

// 初始化
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.checkout = checkout;

// 首次渲染
renderGroupSelect();
renderProducts();
renderCart();