export function Footer() {
  return (
    <footer className="bg-muted/50 py-6 mt-12 border-t">
      <div className="container mx-auto text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Mercado Local. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
