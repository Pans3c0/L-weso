import { products } from '@/lib/data';
import { ProductCard } from '@/components/products/product-card';

export default function HomePage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">Nuestros Productos</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Productos frescos y de calidad, directamente de productores locales a tu mesa.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
