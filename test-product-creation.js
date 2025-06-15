import { Product } from './src/models/Product.js';

async function testProductCreation() {
  try {
    console.log('Testing product creation...');
    
    const testProduct = {
      name: 'Test Product',
      description: 'Test description',
      price: 99.99,
      category: 'normal',
      image_url: '/images/products/test.jpg',
      is_popular: false
    };
    
    console.log('Attempting to create product with data:', testProduct);
    
    const result = await Product.create(testProduct);
    console.log('Product created successfully:', result);
    
  } catch (error) {
    console.error('Error during test:', error);
    console.error('Stack trace:', error.stack);
  }
}

testProductCreation();
