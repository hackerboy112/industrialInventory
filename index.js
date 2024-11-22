document.addEventListener('DOMContentLoaded', async () => {
    const productSelect = document.getElementById('product');
    const orderForm = document.getElementById('orderForm');
    const dbStatusIndicator = document.createElement('p');
    dbStatusIndicator.id = 'dbStatus';
    dbStatusIndicator.style.color = 'red';
    document.body.prepend(dbStatusIndicator);

    try {
        const response = await fetch('/db-status');
        const { status } = await response.json();

        if (status === 'connected') {
            dbStatusIndicator.textContent = 'Database Status: Connected';
            dbStatusIndicator.style.color = 'green';
        } else {
            dbStatusIndicator.textContent = 'Database Status: Disconnected';
        }
    } catch (error) {
        console.error('Error checking database status:', error);
        dbStatusIndicator.textContent = 'Database Status: Unknown (Error checking status)';
    }

    try {
        const response = await fetch('/products');
        if (!response.ok) throw new Error('Failed to fetch products');

        const products = await response.json();
        productSelect.innerHTML = `
            <option value="" disabled selected>Select a product</option>
            ${products.map(p => `<option value="${p.articleNumber}">${p.name}</option>`).join('')}
        `;
    } catch (error) {
        console.error('Error fetching products:', error);
        alert('Unable to load products.');
    }

    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const productId = productSelect.value;
        const quantity = document.getElementById('quantity').value;
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;

        if (!productId) return alert('Please select a product');

        try {
            const response = await fetch('/submit-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId, quantity, customer_name: customerName, customer_email: customerEmail })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Order submission failed');

            alert('Order placed successfully');
            updatePurchaseHistory(data.product, quantity);
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('Error submitting order.');
        }
    });
});

function updatePurchaseHistory(product, quantity) {
    const history = document.getElementById('purchaseHistory');
    const newItem = document.createElement('li');
    newItem.textContent = `Ordered ${quantity} of ${product.name}`;
    history.appendChild(newItem);
}
