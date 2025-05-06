import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ShoppingBag, Heart, DollarSign, TrendingUp } from "lucide-react";

const DashboardHomepage = () => {
  const stats = [
    {
      title: "Total Orders",
      value: "12",
      icon: ShoppingBag,
      description: "From last month",
      trend: "+2.5%"
    },
    {
      title: "Wishlist Items",
      value: "8",
      icon: Heart,
      description: "Active items",
      trend: "+1.2%"
    },
    {
      title: "Total Revenue",
      value: "$1,234",
      icon: DollarSign,
      description: "From last month",
      trend: "+4.3%"
    },
    {
      title: "Active Users",
      value: "573",
      icon: TrendingUp,
      description: "From last month",
      trend: "+3.1%"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Dashboard</h1>
        <p className="text-[#666666] mt-2">Welcome to your dashboard</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#666666]">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-[#8B5E3C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1A1A1A]">{stat.value}</div>
              <p className="text-xs text-[#666666] mt-1">
                {stat.description}
                <span className="text-green-600 ml-1">{stat.trend}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#666666]">No recent orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wishlist Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#666666]">No wishlist items</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHomepage;