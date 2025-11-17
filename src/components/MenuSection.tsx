import MenuCard from "./MenuCard";
import cinnamonRollsImg from "@/assets/cinnamon-rolls.jpg";
import browniesImg from "@/assets/brownies.jpg";
import cookiesImg from "@/assets/cookies.jpg";
import cakePopsImg from "@/assets/cake-pops.jpg";
import cupcakesImg from "@/assets/cupcakes.jpg";
import bananaBreadImg from "@/assets/banana-bread.jpg";
import fruitcakeImg from "@/assets/fruit-cakes.jpg";
import birthdayCakesImg from "@/assets/birthday-cakes.jpg";

const menuItems = [
  {
    id: "cinnamon-rolls",
    image: cinnamonRollsImg,
    title: "Cinnamon Rolls",
    description: "Warm, gooey cinnamon rolls topped with cream cheese frosting. A heavenly treat that melts in your mouth.",
    price: "From Ksh 1500",
  },
  {
    id: "brownies",
    image: browniesImg,
    title: "Brownies",
    description: "Rich, fudgy chocolate brownies with the perfect crispy top and gooey center. Pure chocolate bliss in every bite.",
    price: "From Ksh 1500",
  },
  {
    id: "cookies",
    image: cookiesImg,
    title: "Cookies",
    description: "Assorted cookies including chocolate chip, oatmeal raisin, and sugar cookies. Perfectly chewy and delicious.",
    price: "From Ksh 700",
  },
  {
    id: "cake-pops",
    image: cakePopsImg,
    title: "Cake Pops",
    description: "Adorable bite-sized cake pops covered in colorful coating and sprinkles. Perfect for parties and celebrations.",
    price: "From Ksh 1200",
  },
  {
    id: "cupcakes",
    image: cupcakesImg,
    title: "Cupcakes",
    description: "Beautifully decorated cupcakes with buttercream frosting. Available in various flavors to satisfy every sweet tooth.",
    price: "From Ksh 1200",
  },
  {
    id: "banana-bread",
    image: bananaBreadImg,
    title: "Banana Bread",
    description: "Moist and flavorful banana bread made with ripe bananas. A classic favorite that's perfect with coffee or tea.",
    price: "Ksh 1800",
  },
  {
    id: "fruitcake",
    image: fruitcakeImg,
    title: "Fruitcake",
    description: "Traditional fruitcake loaded with candied fruits, nuts, and warm spices. A timeless treat for special occasions.",
    price: "Ksh 2000 per kg",
  },
  {
    id: "birthday-cakes",
    image: birthdayCakesImg,
    title: "Birthday Cakes",
    description: "Custom birthday cakes designed to make your celebration unforgettable. Choose from various flavors and decorations.",
    price: "Ksh 2000 per kg",
  },
];

const MenuSection = () => {
  return (
    <section id="menu" className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Our Menu
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our delicious selection of home-baked treats, made fresh daily with premium ingredients
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {menuItems.map((item, index) => (
            <div
              key={item.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <MenuCard {...item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
