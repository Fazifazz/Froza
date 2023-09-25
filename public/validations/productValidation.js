// Add event listeners for the input fields
const nameInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const stockInput = document.getElementById('stock');
const priceInput = document.getElementById('mrp');
const RpriceInput = document.getElementById('regular');
const brandInput = document.getElementById('brand');



nameInput.addEventListener('input', validateName);
brandInput.addEventListener('input', validateBrand);
descriptionInput.addEventListener('input', validateDescription);
priceInput.addEventListener('input', validatePrice);
RpriceInput.addEventListener('input', validateRPrice);
stockInput.addEventListener('input', validateStock);


function validateName() {
    const name = nameInput.value.trim();

    if (name.length === 0) {
        nameErr.innerHTML = 'Product Name required';
        return false;
    } else {
        nameErr.innerHTML = '';
    }

    return true;
}

function validateDescription() {
    const description = descriptionInput.value.trim();

    if (description.length === 0) {
        descriptionErr.innerHTML = 'Description required';
        return false;
    } else {
        descriptionErr.innerHTML = '';
    }

    return true;
}

function validatePrice() {
    const price = parseFloat(priceInput.value);

    if (isNaN(price) || price <= 0) {
        priceErr.innerHTML = 'Price must be a positive number';
        return false;
    } else if (price < 100) {
        priceErr.innerHTML = 'Price must be greater than 100';
        return false;
    } else if (price > 10000) {
        priceErr.innerHTML = 'Price must be less than 10,000';
        return false;
    } else {
        priceErr.innerHTML = '';
    }

    return true;
}
function validateRPrice() {
    const price = parseFloat(RpriceInput.value);

    if (isNaN(price) || price <= 0) {
        priceErr2.innerHTML = 'Price must be a positive number';
        return false;
    } else if (price < 100) {
        priceErr2.innerHTML = 'Price must be greater than 100';
        return false;
    } else if (price > 10000) {
        priceErr2.innerHTML = 'Price must be less than 10,000';
        return false;
    } else {
        priceErr2.innerHTML = '';
    }

    return true;
}
function validateBrand(){
    const brand = document.getElementById('brand').value.trim()

    if(brand.length === 0){
        brandErr.innerHTML = 'Brand Name required';
        return false
    }else{
        brandErr.innerHTML = ''
    }

    return true;
}




function validateStock() {
    const stock = parseInt(stockInput.value);

    if (isNaN(stock) || stock <= 0) {
        stockErr.innerHTML = 'Stock must be a positive number';
        return false;
    } else if (stock > 1000) {
        stockErr.innerHTML = 'Stock must be less than 1,000';
        return false;
    } else {
        stockErr.innerHTML = '';
    }

    return true;
}




    function validateProduct(){
        return ( 
            validateName() &&
            validateDescription() &&
            validateQuantity() &&
            validatePrice()&&
            validateRPrice()&&
            validateBrand() 
        );
    }