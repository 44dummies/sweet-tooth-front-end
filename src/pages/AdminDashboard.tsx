"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { supabase, type Order, type OrderItem } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  LogOut,
  Package,
  DollarSign,
  Users,
  TrendingUp,
  BarChart3,
  PackageSearch,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  ChefHat,
  AlertTriangle,
  RefreshCw,
  Tag,
  ShoppingBag,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart,
  Target,
  Wallet,
  CreditCard,
  Receipt,
  Award,
  TrendingDown,
  Percent,
  ShoppingCart,
  Globe,
  Boxes,
  Gift,
  Megaphone,
  Ear as Gear,
  Users2,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts"
import AdminBottomNav from "@/components/AdminBottomNav"
import logo from "@/assets/logo.png"

const AdminDashboard = () => {
  const [orders, setOrders] = useState<(Order & { order_items?: OrderItem[] })[]>([])
  const [customOrders, setCustomOrders] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [promotions, setPromotions] = useState<any[]>([])
  const [giftCards, setGiftCards] = useState<any[]>([])
  const [staffMembers, setStaffMembers] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState("30d")
  const [searchQuery, setSearchQuery] = useState("")
  const [dataError, setDataError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isLiveUpdating, setIsLiveUpdating] = useState(false)
  const idleTimerRef = useRef<number | null>(null)
  const lastActiveKey = "admin:lastActive"
  const reauthFlagKey = "admin:forceReauth"
  const navigate = useNavigate()

  const generateDemoData = () => {
    const today = new Date()
    const demoOrders: any[] = []
    const statusOptions = ["PENDING", "CONFIRMED", "PREPARING", "DELIVERED", "CANCELLED"]
    const paymentOptions = ["PAID", "PENDING", "FAILED"]
    const products = [
      "Birthday Cake",
      "Wedding Cake",
      "Cupcakes (12)",
      "Pastry Box",
      "Custom Cake",
      "Bread Loaf",
      "Cookies (24)",
      "Croissants (6)",
    ]

    for (let i = 0; i < 150; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - Math.floor(Math.random() * 90))
      const amount = Math.floor(Math.random() * 8000) + 500

      demoOrders.push({
        id: `demo-${i}`,
        customer_name: `Customer ${i + 1}`,
        customer_phone: `+254${Math.floor(Math.random() * 900000000 + 100000000)}`,
        customer_email: `customer${i + 1}@example.com`,
        total_amount: amount,
        status: statusOptions[Math.floor(Math.random() * statusOptions.length)],
        payment_status: paymentOptions[Math.floor(Math.random() * paymentOptions.length)],
        created_at: date.toISOString(),
        order_items: [
          {
            product_name: products[Math.floor(Math.random() * products.length)],
            quantity: Math.floor(Math.random() * 3) + 1,
            price: amount,
          },
        ],
      })
    }

    return demoOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  useEffect(() => {
    if (localStorage.getItem(reauthFlagKey) === "1") {
      localStorage.removeItem(reauthFlagKey)
      supabase.auth.signOut().finally(() => navigate("/admin/login", { replace: true, state: { reason: "reauth" } }))
      return
    }

    checkAuth()
    fetchAllData()

    const ordersChannel = supabase
      .channel("admin-orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        console.log("Order change detected:", payload)
        setIsLiveUpdating(true)
        setLastUpdate(new Date())

        if (payload.eventType === "INSERT") {
          toast.success("🎉 New order received!", {
            description: `From ${payload.new.customer_name}`,
            duration: 5000,
          })
        } else if (payload.eventType === "UPDATE") {
          const statusChanged = payload.old?.status !== payload.new?.status
          const paymentChanged = payload.old?.payment_status !== payload.new?.payment_status

          if (statusChanged) {
            toast.info("📦 Order status updated", {
              description: `${payload.new.customer_name}: ${payload.new.status}`,
              duration: 3000,
            })
          }
          if (paymentChanged) {
            toast.info("💳 Payment status updated", {
              description: `${payload.new.customer_name}: ${payload.new.payment_status}`,
              duration: 3000,
            })
          }
        }

        fetchAllData()
        setTimeout(() => setIsLiveUpdating(false), 1000)
      })
      .subscribe()

    const customOrdersChannel = supabase
      .channel("admin-custom-orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "custom_orders" }, (payload) => {
        setIsLiveUpdating(true)
        setLastUpdate(new Date())

        if (payload.eventType === "INSERT") {
          toast.success("🎂 New custom order!", {
            description: `From ${payload.new.customer_name}`,
            duration: 5000,
          })
        } else if (payload.eventType === "UPDATE") {
          toast.info("✅ Custom order updated", {
            description: `Status: ${payload.new.status}`,
            duration: 3000,
          })
        }

        fetchAllData()
        setTimeout(() => setIsLiveUpdating(false), 1000)
      })
      .subscribe()

    const reviewsChannel = supabase
      .channel("admin-reviews-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, (payload) => {
        setIsLiveUpdating(true)
        setLastUpdate(new Date())

        if (payload.eventType === "INSERT") {
          toast.success("⭐ New review submitted!", {
            description: `From ${payload.new.name}`,
            duration: 5000,
          })
        } else if (payload.eventType === "UPDATE") {
          if (payload.new.approved && !payload.old?.approved) {
            toast.info("✅ Review approved", {
              description: `From ${payload.new.name}`,
              duration: 3000,
            })
          }
        } else if (payload.eventType === "DELETE") {
          toast.info("🗑️ Review deleted", { duration: 2000 })
        }

        fetchAllData()
        setTimeout(() => setIsLiveUpdating(false), 1000)
      })
      .subscribe()

    const productsChannel = supabase
      .channel("admin-products-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, (payload) => {
        setIsLiveUpdating(true)
        setLastUpdate(new Date())

        if (payload.eventType === "UPDATE") {
          const stockChanged = payload.old?.in_stock !== payload.new?.in_stock
          const offerChanged = payload.old?.on_offer !== payload.new?.on_offer

          if (stockChanged) {
            toast.info("📦 Product stock updated", {
              description: `${payload.new.name}: ${payload.new.in_stock ? "Available" : "Sold Out"}`,
              duration: 2000,
            })
          }
          if (offerChanged) {
            toast.info("🏷️ Product offer updated", {
              description: `${payload.new.name}: ${payload.new.on_offer ? "On Offer" : "Regular Price"}`,
              duration: 2000,
            })
          }
        }

        fetchAllData()
        setTimeout(() => setIsLiveUpdating(false), 1000)
      })
      .subscribe()

    // Activity tracking for session timeout
    const markActive = () => localStorage.setItem(lastActiveKey, Date.now().toString())
    const checkIdle = () => {
      const last = Number(localStorage.getItem(lastActiveKey) || Date.now())
      const idleMs = Date.now() - last
      const limit = 30 * 60 * 1000
      if (idleMs > limit) {
        window.clearInterval(idleTimerRef.current!)
        supabase.auth.signOut().finally(() => navigate("/admin/login", { replace: true, state: { reason: "timeout" } }))
      }
    }

    markActive()
    const activityEvents: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "touchstart", "scroll"]
    activityEvents.forEach((evt) => window.addEventListener(evt, markActive, { passive: true }))
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) markActive()
    })
    idleTimerRef.current = window.setInterval(checkIdle, 30000)

    const beforeUnload = () => {
      localStorage.setItem(reauthFlagKey, "1")
      markActive()
    }
    window.addEventListener("beforeunload", beforeUnload)

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(customOrdersChannel)
      supabase.removeChannel(reviewsChannel)
      supabase.removeChannel(productsChannel)
      if (idleTimerRef.current) window.clearInterval(idleTimerRef.current)
      activityEvents.forEach((evt) => window.removeEventListener(evt, markActive))
      window.removeEventListener("beforeunload", beforeUnload)
    }
  }, [])

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      navigate("/admin/login")
      return
    }

    const adminEmail = "muindidamian@gmail.com"
    if (session.user.email !== adminEmail) {
      await supabase.auth.signOut()
      toast.error("Access denied. Admin only.")
      navigate("/admin/login")
      return
    }

    setUser(session.user)
  }

  const fetchAllData = async () => {
    setLoading(true)
    setDataError(null)

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(
          "id, customer_name, customer_phone, customer_email, total_amount, status, payment_status, created_at, delivery_address, delivery_date, special_instructions",
        )
        .order("created_at", { ascending: false })

      if (ordersError) {
        console.error("Orders fetch error:", ordersError)
        setDataError(`Error loading orders: ${ordersError.message}`)
        setOrders([])
      } else {
        const orderIds = ordersData?.map((o) => o.id) || []
        let orderItems: any[] = []

        if (orderIds.length > 0) {
          const { data: itemsData } = await supabase.from("order_items").select("*").in("order_id", orderIds)
          orderItems = itemsData || []
        }

        const ordersWithItems =
          ordersData?.map((order) => ({
            ...order,
            order_items: orderItems.filter((item) => item.order_id === order.id),
          })) || []

        setOrders(ordersWithItems)
      }

      const [customOrdersRes, reviewsRes, productsRes] = await Promise.all([
        supabase.from("custom_orders").select("*").order("created_at", { ascending: false }),
        supabase.from("reviews").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*").order("name"),
      ])

      setCustomOrders(customOrdersRes.data || [])
      setReviews(reviewsRes.data || [])
      setProducts(productsRes.data || [])

      // Mock data for new PRD features - in production these would be from real tables
      setInventory(generateMockInventory())
      setCustomers(generateMockCustomers())
      setPromotions(generateMockPromotions())
      setGiftCards(generateMockGiftCards())
      setStaffMembers(generateMockStaffMembers())
    } catch (err) {
      console.error("Data fetch error:", err)
      setDataError(`Error loading data: ${err instanceof Error ? err.message : "Unknown error"}`)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const generateMockInventory = () => [
    {
      id: "1",
      name: "All Purpose Flour",
      quantity: 50,
      unit: "kg",
      reorder_level: 20,
      cost: 500,
      supplier: "Grain Mills Ltd",
    },
    { id: "2", name: "Sugar", quantity: 8, unit: "kg", reorder_level: 15, cost: 250, supplier: "Sugar Co" },
    { id: "3", name: "Butter", quantity: 30, unit: "kg", reorder_level: 10, cost: 1200, supplier: "Dairy Fresh" },
    { id: "4", name: "Eggs", quantity: 12, unit: "dozen", reorder_level: 5, cost: 300, supplier: "Farm Direct" },
    {
      id: "5",
      name: "Vanilla Extract",
      quantity: 2,
      unit: "liters",
      reorder_level: 3,
      cost: 800,
      supplier: "Spice House",
    },
  ]

  const generateMockCustomers = () => [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+254712345678",
      total_orders: 5,
      lifetime_value: 25000,
      last_order: "2025-11-20",
      segment: "VIP",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+254712345679",
      total_orders: 2,
      lifetime_value: 8000,
      last_order: "2025-11-15",
      segment: "Regular",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+254712345680",
      total_orders: 1,
      lifetime_value: 3500,
      last_order: "2025-11-10",
      segment: "New",
    },
  ]

  const generateMockPromotions = () => [
    {
      id: "1",
      code: "WELCOME10",
      discount_type: "percentage",
      discount_value: 10,
      active: true,
      usage_count: 45,
      expiry: "2025-12-31",
    },
    {
      id: "2",
      code: "FREESHIP",
      discount_type: "fixed",
      discount_value: 300,
      active: true,
      usage_count: 120,
      expiry: "2025-12-15",
    },
    {
      id: "3",
      code: "HOLIDAY25",
      discount_type: "percentage",
      discount_value: 25,
      active: false,
      usage_count: 200,
      expiry: "2025-11-30",
    },
  ]

  const generateMockGiftCards = () => [
    {
      id: "1",
      code: "GC001",
      original_amount: 5000,
      current_balance: 2000,
      purchased_by: "John",
      recipient: "Sarah",
      expiry: "2026-01-15",
    },
    {
      id: "2",
      code: "GC002",
      original_amount: 10000,
      current_balance: 10000,
      purchased_by: "Admin",
      recipient: "Corporate",
      expiry: "2026-02-15",
    },
  ]

  const generateMockStaffMembers = () => [
    { id: "1", name: "Alice Manager", email: "alice@sweetooth.com", role: "Manager", status: "active" },
    { id: "2", name: "Bob Baker", email: "bob@sweetooth.com", role: "Kitchen Staff", status: "active" },
    { id: "3", name: "Carol Support", email: "carol@sweetooth.com", role: "Customer Support", status: "active" },
  ]

  const handleLogout = async () => {
    localStorage.removeItem(lastActiveKey)
    localStorage.removeItem(reauthFlagKey)
    await supabase.auth.signOut()
    navigate("/admin/login")
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)
      if (error) throw error
      toast.success("Order status updated")
      fetchAllData()
    } catch (err) {
      toast.error("Failed to update order")
    }
  }

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("orders").update({ payment_status: newStatus }).eq("id", orderId)
      if (error) throw error
      toast.success("Payment status updated")
      fetchAllData()
    } catch (err) {
      toast.error("Failed to update payment")
    }
  }

  const approveReview = async (reviewId: string) => {
    try {
      const { error } = await supabase.from("reviews").update({ approved: true }).eq("id", reviewId)
      if (error) throw error
      toast.success("Review approved")
      fetchAllData()
    } catch (err) {
      toast.error("Failed to approve review")
    }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Delete this review permanently?")) return
    try {
      const { error } = await supabase.from("reviews").delete().eq("id", reviewId)
      if (error) throw error
      toast.success("Review deleted")
      fetchAllData()
    } catch (err) {
      toast.error("Failed to delete review")
    }
  }

  const toggleProductStock = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("products").update({ in_stock: !currentStatus }).eq("id", productId)
      if (error) throw error
      toast.success(currentStatus ? "Product marked as sold out" : "Product now available")
      fetchAllData()
    } catch (err) {
      toast.error("Failed to update product")
    }
  }

  const toggleProductOffer = async (productId: string, currentOffer: boolean) => {
    try {
      const { error } = await supabase.from("products").update({ on_offer: !currentOffer }).eq("id", productId)
      if (error) throw error
      toast.success(!currentOffer ? "Product added to offers" : "Product removed from offers")
      fetchAllData()
    } catch (err) {
      toast.error("Failed to update product")
    }
  }

  const approveCustomOrder = async (orderId: string) => {
    try {
      const { error } = await supabase.from("custom_orders").update({ status: "confirmed" }).eq("id", orderId)
      if (error) throw error
      toast.success("Custom order approved!")
      fetchAllData()
    } catch (err) {
      toast.error("Failed to approve custom order")
    }
  }

  const analytics = useMemo(() => {
    const now = new Date()
    const daysAgo = (days: number) => {
      const date = new Date(now)
      date.setDate(date.getDate() - days)
      return date
    }

    const rangeDays = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365
    const rangeStart = daysAgo(rangeDays)
    const prevRangeStart = daysAgo(rangeDays * 2)

    const filteredOrders = orders.filter((o) => new Date(o.created_at) >= rangeStart)
    const prevOrders = orders.filter(
      (o) => new Date(o.created_at) >= prevRangeStart && new Date(o.created_at) < rangeStart,
    )

    const totalRevenue = filteredOrders
      .filter((o) => o.payment_status === "PAID")
      .reduce((sum, o) => sum + o.total_amount, 0)
    const prevRevenue = prevOrders
      .filter((o) => o.payment_status === "PAID")
      .reduce((sum, o) => sum + o.total_amount, 0)
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

    const totalOrders = filteredOrders.length
    const prevTotalOrders = prevOrders.length
    const ordersGrowth = prevTotalOrders > 0 ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const prevAvgOrder = prevTotalOrders > 0 ? prevRevenue / prevTotalOrders : 0
    const avgOrderGrowth = prevAvgOrder > 0 ? ((avgOrderValue - prevAvgOrder) / prevAvgOrder) * 100 : 0

    const uniqueCustomers = new Set(filteredOrders.map((o) => o.customer_phone)).size
    const prevUniqueCustomers = new Set(prevOrders.map((o) => o.customer_phone)).size
    const customersGrowth =
      prevUniqueCustomers > 0 ? ((uniqueCustomers - prevUniqueCustomers) / prevUniqueCustomers) * 100 : 0

    const pendingOrders = filteredOrders.filter((o) => o.status === "PENDING" || o.status === "pending").length
    const confirmedOrders = filteredOrders.filter((o) =>
      ["CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "IN_DELIVERY", "DELIVERED"].includes(
        o.status?.toUpperCase() || "",
      ),
    ).length
    const deliveredOrders = filteredOrders.filter((o) => o.status?.toUpperCase() === "DELIVERED").length
    const cancelledOrders = filteredOrders.filter((o) => o.status?.toUpperCase() === "CANCELLED").length
    const conversionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0

    const paidOrders = filteredOrders.filter((o) => o.payment_status === "PAID").length
    const pendingPayments = filteredOrders.filter(
      (o) => o.payment_status === "PENDING" || o.payment_status === "pending",
    ).length
    const paymentSuccessRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0

    const dailyData: { [key: string]: { date: string; revenue: number; orders: number; fullDate: string } } = {}
    filteredOrders.forEach((order) => {
      const date = new Date(order.created_at)
      const key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      const fullDate = date.toISOString().split("T")[0]
      if (!dailyData[fullDate]) {
        dailyData[fullDate] = { date: key, revenue: 0, orders: 0, fullDate }
      }
      if (order.payment_status === "PAID") {
        dailyData[fullDate].revenue += order.total_amount
      }
      dailyData[fullDate].orders += 1
    })

    const dailyRevenue = Object.values(dailyData).sort((a, b) => a.fullDate.localeCompare(b.fullDate))

    const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {}
    filteredOrders.forEach((order) => {
      order.order_items?.forEach((item: any) => {
        const name = item.product_name || "Unknown"
        if (!productSales[name]) {
          productSales[name] = { name, quantity: 0, revenue: 0 }
        }
        productSales[name].quantity += item.quantity || 1
        productSales[name].revenue += (item.price || 0) * (item.quantity || 1)
      })
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)

    const statusDistribution = [
      { name: "Pending", value: pendingOrders, color: "#f59e0b" },
      { name: "Confirmed", value: confirmedOrders, color: "#3b82f6" },
      { name: "Delivered", value: deliveredOrders, color: "#10b981" },
      { name: "Cancelled", value: cancelledOrders, color: "#ef4444" },
    ].filter((s) => s.value > 0)

    const paymentDistribution = [
      { name: "Paid", value: paidOrders, color: "#10b981" },
      { name: "Pending", value: pendingPayments, color: "#f59e0b" },
      { name: "Failed", value: filteredOrders.filter((o) => o.payment_status === "FAILED").length, color: "#ef4444" },
    ].filter((s) => s.value > 0)

    const hourlyData: { [key: number]: number } = {}
    for (let i = 0; i < 24; i++) hourlyData[i] = 0
    filteredOrders.forEach((order) => {
      const hour = new Date(order.created_at).getHours()
      hourlyData[hour]++
    })

    const hourlyOrders = Object.entries(hourlyData).map(([hour, count]) => ({
      hour: `${hour}:00`,
      orders: count,
    }))

    const weeklyData: { [key: string]: { week: string; revenue: number; orders: number } } = {}
    filteredOrders.forEach((order) => {
      const date = new Date(order.created_at)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const key = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      if (!weeklyData[key]) {
        weeklyData[key] = { week: key, revenue: 0, orders: 0 }
      }
      if (order.payment_status === "PAID") {
        weeklyData[key].revenue += order.total_amount
      }
      weeklyData[key].orders += 1
    })

    const weeklyRevenue = Object.values(weeklyData).slice(-12)

    return {
      totalRevenue,
      revenueGrowth,
      totalOrders,
      ordersGrowth,
      avgOrderValue,
      avgOrderGrowth,
      uniqueCustomers,
      customersGrowth,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      conversionRate,
      paymentSuccessRate,
      paidOrders,
      pendingPayments,
      dailyRevenue,
      topProducts,
      statusDistribution,
      paymentDistribution,
      hourlyOrders,
      weeklyRevenue,
      todayOrders: orders.filter((o) => new Date(o.created_at).toDateString() === now.toDateString()).length,
      todayRevenue: orders
        .filter((o) => new Date(o.created_at).toDateString() === now.toDateString() && o.payment_status === "PAID")
        .reduce((sum, o) => sum + o.total_amount, 0),
    }
  }, [orders, dateRange])

  const CHART_COLORS = ["#ec4899", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16"]

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "PREPARING":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "READY_FOR_PICKUP":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400"
      case "IN_DELIVERY":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const formatCurrency = (amount: number) => `Ksh ${amount.toLocaleString()}`
  const formatPercent = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-pink-500/20 rounded-full animate-spin border-t-pink-500"></div>
            <img src={logo || "/placeholder.svg"} alt="Loading" className="absolute inset-0 m-auto w-12 h-12" />
          </div>
          <p className="text-lg font-medium text-white/70 mt-4">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/30 dark:from-slate-950 dark:via-purple-950/50 dark:to-slate-950">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-border/40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img src={logo || "/placeholder.svg"} alt="Sweet Tooth" className="w-12 h-12" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Admin Control Center
                </h1>
                <p className="text-xs text-muted-foreground">Sweet Tooth Bakery Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full">
                <div
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${isLiveUpdating ? "bg-green-500 animate-pulse" : "bg-green-500"}`}
                />
                <span className="text-xs font-medium text-muted-foreground">Live</span>
                <span className="text-[10px] text-muted-foreground/60">{lastUpdate.toLocaleTimeString()}</span>
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px] h-9 text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="365d">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchAllData} className="gap-2 h-9 bg-transparent">
                <RefreshCw className="w-3 h-3" />
                <span className="hidden md:inline">Refresh</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 h-9">
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex flex-wrap gap-2 mb-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-1.5 rounded-xl border overflow-x-auto">
            <TabsTrigger
              value="overview"
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm relative"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
              {analytics.pendingOrders > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500 border-2 border-white">
                  {analytics.pendingOrders}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm"
            >
              <PackageSearch className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm relative"
            >
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Reviews</span>
              {reviews.filter((r) => !r.approved).length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-amber-500 border-2 border-white">
                  {reviews.filter((r) => !r.approved).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm"
            >
              <Boxes className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm"
            >
              <Users2 className="w-4 h-4" />
              <span className="hidden sm:inline">Customers</span>
            </TabsTrigger>
            <TabsTrigger
              value="promotions"
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm"
            >
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Promos</span>
            </TabsTrigger>
            <TabsTrigger
              value="gift-cards"
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-fuchsia-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm"
            >
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Gifts</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-slate-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm"
            >
              <Gear className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-pink-500 to-rose-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-3">
                    <DollarSign className="w-10 h-10 text-white/90" />
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      {formatPercent(analytics.revenueGrowth)}
                    </Badge>
                  </div>
                  <p className="text-white/80 text-sm font-medium mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(analytics.totalRevenue)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {analytics.revenueGrowth >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-white/80" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-white/80" />
                    )}
                    <span className="text-xs text-white/70">vs previous period</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-3">
                    <ShoppingBag className="w-10 h-10 text-white/90" />
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      {formatPercent(analytics.ordersGrowth)}
                    </Badge>
                  </div>
                  <p className="text-white/80 text-sm font-medium mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-white">{analytics.totalOrders}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Activity className="w-4 h-4 text-white/80" />
                    <span className="text-xs text-white/70">{analytics.todayOrders} today</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-3">
                    <Receipt className="w-10 h-10 text-white/90" />
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      {formatPercent(analytics.avgOrderGrowth)}
                    </Badge>
                  </div>
                  <p className="text-white/80 text-sm font-medium mb-1">Avg Order Value</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(analytics.avgOrderValue)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-white/80" />
                    <span className="text-xs text-white/70">per transaction</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-3">
                    <Users className="w-10 h-10 text-white/90" />
                    <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                      {formatPercent(analytics.customersGrowth)}
                    </Badge>
                  </div>
                  <p className="text-white/80 text-sm font-medium mb-1">Customers</p>
                  <p className="text-3xl font-bold text-white">{analytics.uniqueCustomers}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Globe className="w-4 h-4 text-white/80" />
                    <span className="text-xs text-white/70">unique buyers</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Today's Revenue</p>
                      <p className="text-xl font-bold">{formatCurrency(analytics.todayRevenue)}</p>
                    </div>
                    <Wallet className="w-8 h-8 text-green-500/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
                      <p className="text-xl font-bold">{analytics.conversionRate.toFixed(1)}%</p>
                    </div>
                    <Target className="w-8 h-8 text-blue-500/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Payment Success</p>
                      <p className="text-xl font-bold">{analytics.paymentSuccessRate.toFixed(1)}%</p>
                    </div>
                    <CreditCard className="w-8 h-8 text-purple-500/40" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Pending Orders</p>
                      <p className="text-xl font-bold">{analytics.pendingOrders}</p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-500/40" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Charts */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-pink-500" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription>Daily revenue performance over selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics.dailyRevenue}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255,255,255,0.95)",
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                        formatter={(value: any) => formatCurrency(value)}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#ec4899"
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-500" />
                    Order Status
                  </CardTitle>
                  <CardDescription>Current order distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={analytics.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <Card className="border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Top Performing Products
                </CardTitle>
                <CardDescription>Best sellers by revenue in selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                    <YAxis dataKey="name" type="category" width={120} stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.95)",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value: any, name: string) => [
                        name === "revenue" ? formatCurrency(value) : value,
                        name,
                      ]}
                    />
                    <Bar dataKey="revenue" fill="url(#barGradient)" radius={[0, 8, 8, 0]}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Weekly Revenue Comparison
                  </CardTitle>
                  <CardDescription>Week-over-week performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={analytics.weeklyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                      <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
                      <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255,255,255,0.95)",
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" fill="#8b5cf6" name="Revenue (Ksh)" />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        stroke="#ec4899"
                        strokeWidth={2}
                        name="Orders"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Hourly Order Distribution
                  </CardTitle>
                  <CardDescription>Peak hours analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.hourlyOrders}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                      <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255,255,255,0.95)",
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-500" />
                  Payment Analytics
                </CardTitle>
                <CardDescription>Payment status and success metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPieChart>
                        <Pie
                          data={analytics.paymentDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.paymentDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Payment Success Rate</span>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-3xl font-bold text-green-600">{analytics.paymentSuccessRate.toFixed(1)}%</p>
                      <Progress value={analytics.paymentSuccessRate} className="mt-2 h-2" />
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">Orders Paid</span>
                        <Wallet className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {analytics.paidOrders} / {analytics.totalOrders}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{analytics.pendingPayments} pending payments</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="border-0 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    Conversion Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Delivery Rate</span>
                      <span className="font-semibold">{analytics.conversionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={analytics.conversionRate} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Delivered</p>
                      <p className="text-lg font-bold text-green-600">{analytics.deliveredOrders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cancelled</p>
                      <p className="text-lg font-bold text-red-600">{analytics.cancelledOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-blue-500" />
                    Order Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending</span>
                    <Badge className="bg-amber-100 text-amber-800">{analytics.pendingOrders}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confirmed</span>
                    <Badge className="bg-blue-100 text-blue-800">{analytics.confirmedOrders}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <Badge className="bg-green-100 text-green-800">{analytics.deliveredOrders}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Percent className="w-4 h-4 text-pink-500" />
                    Growth Indicators
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Revenue</span>
                    <div className="flex items-center gap-1">
                      {analytics.revenueGrowth >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-semibold ${analytics.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatPercent(analytics.revenueGrowth)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Orders</span>
                    <div className="flex items-center gap-1">
                      {analytics.ordersGrowth >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-semibold ${analytics.ordersGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatPercent(analytics.ordersGrowth)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Customers</span>
                    <div className="flex items-center gap-1">
                      {analytics.customersGrowth >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-semibold ${analytics.customersGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatPercent(analytics.customersGrowth)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ORDERS TAB */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-pink-500" />
                    All Orders ({orders.length})
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={fetchAllData} className="gap-2 bg-transparent">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Order</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Customer</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Amount</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Status</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Payment</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Date</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-secondary/20 transition-colors">
                          <td className="p-3">
                            <code className="text-xs bg-secondary px-2 py-1 rounded">#{order.id.substring(0, 8)}</code>
                          </td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-sm">{order.customer_name}</p>
                              <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                            </div>
                          </td>
                          <td className="p-3 font-semibold text-sm">Ksh {order.total_amount.toLocaleString()}</td>
                          <td className="p-3">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border-0 ${getStatusColor(order.status)}`}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="PREPARING">Preparing</option>
                              <option value="READY_FOR_PICKUP">Ready</option>
                              <option value="IN_DELIVERY">Delivery</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={order.payment_status}
                              onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border-0 ${
                                order.payment_status === "PAID"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="PAID">Paid</option>
                              <option value="FAILED">Failed</option>
                              <option value="REFUNDED">Refunded</option>
                            </select>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              {order.status === "PENDING" && (
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
                                  className="h-8 bg-green-500 hover:bg-green-600 text-xs"
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Confirm
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs bg-transparent"
                                onClick={() => {
                                  const msg = `Hello ${order.customer_name}, regarding order #${order.id.substring(0, 8)}...`
                                  window.open(
                                    `https://wa.me/${order.customer_phone?.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`,
                                    "_blank",
                                  )
                                }}
                              >
                                WhatsApp
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-purple-500" />
                  Custom Order Requests ({customOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customOrders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>No custom orders yet</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {customOrders.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 border rounded-xl hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{req.customer_name}</h3>
                            <p className="text-sm text-muted-foreground">{req.customer_phone}</p>
                          </div>
                          <Badge
                            className={
                              req.status === "pending" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"
                            }
                          >
                            {req.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm mb-4">
                          <p>
                            <span className="font-medium">Size:</span> {req.cake_size}
                          </p>
                          <p>
                            <span className="font-medium">Flavor:</span> {req.cake_flavor}
                          </p>
                          <p>
                            <span className="font-medium">Type:</span> {req.cake_type}
                          </p>
                          <p>
                            <span className="font-medium">Delivery:</span>{" "}
                            {new Date(req.delivery_date).toLocaleDateString()}
                          </p>
                          {req.special_requests && (
                            <p className="p-2 bg-secondary/50 rounded text-xs mt-2">{req.special_requests}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {req.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => approveCustomOrder(req.id)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const msg = `Hello ${req.customer_name}, regarding your custom cake order...`
                              window.open(
                                `https://wa.me/${req.customer_phone?.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`,
                                "_blank",
                              )
                            }}
                          >
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRODUCTS TAB */}
          <TabsContent value="products" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PackageSearch className="w-5 h-5 text-blue-500" />
                  Product Management ({products.length})
                </CardTitle>
                <CardDescription>Manage products, stock status, and promotional offers.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Product</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Price</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Stock</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">In Stock</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">On Offer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-secondary/20">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {product.image_url && (
                                <img
                                  src={product.image_url || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-semibold">Ksh {product.price?.toLocaleString()}</td>
                          <td className="p-3">
                            <span
                              className={`text-sm font-medium ${product.stock_quantity <= 5 ? "text-red-500" : "text-green-600"}`}
                            >
                              {product.stock_quantity}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={product.in_stock !== false}
                                onCheckedChange={() => toggleProductStock(product.id, product.in_stock !== false)}
                              />
                              <span
                                className={`text-xs ${product.in_stock !== false ? "text-green-600" : "text-red-500"}`}
                              >
                                {product.in_stock !== false ? "Available" : "Sold Out"}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={product.on_offer === true}
                                onCheckedChange={() => toggleProductOffer(product.id, product.on_offer === true)}
                              />
                              {product.on_offer && (
                                <Badge className="bg-pink-100 text-pink-800 text-xs">
                                  <Tag className="w-3 h-3 mr-1" /> Offer
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REVIEWS TAB */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Customer Reviews
                  </CardTitle>
                  <div className="flex gap-4 text-sm">
                    <span className="text-orange-500 font-medium">
                      Pending: {reviews.filter((r) => !r.approved).length}
                    </span>
                    <span className="text-green-500 font-medium">
                      Approved: {reviews.filter((r) => r.approved).length}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className={`p-4 rounded-xl border ${!review.approved ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200" : "bg-white dark:bg-gray-800"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-pink-100 to-purple-100 text-pink-700">
                              {review.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.email}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              review.approved ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                            }
                          >
                            {review.approved ? "Approved" : "Pending"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                      <div className="flex gap-2 mt-4">
                        {!review.approved && (
                          <Button
                            size="sm"
                            onClick={() => approveReview(review.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => deleteReview(review.id)}>
                          <XCircle className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-rose-500" />
                  Inventory Management
                </CardTitle>
                <CardDescription>Track ingredients and supplies. Low stock items highlighted in red.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Item</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Quantity</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Reorder Level</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Status</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Cost/Unit</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Supplier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item) => (
                        <tr
                          key={item.id}
                          className={`border-b ${item.quantity <= item.reorder_level ? "bg-red-50 dark:bg-red-900/10" : "hover:bg-secondary/20"}`}
                        >
                          <td className="p-3">
                            <p className="font-medium text-sm">{item.name}</p>
                          </td>
                          <td className="p-3">
                            <p
                              className={`font-semibold ${item.quantity <= item.reorder_level ? "text-red-600" : "text-green-600"}`}
                            >
                              {item.quantity} {item.unit}
                            </p>
                          </td>
                          <td className="p-3 text-sm">
                            {item.reorder_level} {item.unit}
                          </td>
                          <td className="p-3">
                            {item.quantity <= item.reorder_level ? (
                              <Badge className="bg-red-100 text-red-800 gap-1">
                                <AlertTriangle className="w-3 h-3" /> Low Stock
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                            )}
                          </td>
                          <td className="p-3 text-sm">Ksh {item.cost}</td>
                          <td className="p-3 text-sm text-muted-foreground">{item.supplier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
                <CardDescription>Items requiring immediate reorder</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inventory
                    .filter((i) => i.quantity <= i.reorder_level)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Current: {item.quantity} {item.unit} | Reorder at: {item.reorder_level} {item.unit}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className="border-red-300 bg-transparent">
                          Contact Supplier
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users2 className="w-5 h-5 text-sky-500" />
                  Customer Management
                </CardTitle>
                <CardDescription>View customer profiles, purchase history, and segments.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Customer</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Contact</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Orders</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Lifetime Value</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Segment</th>
                        <th className="text-left p-3 font-medium text-sm text-muted-foreground">Last Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id} className="border-b hover:bg-secondary/20">
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-sm">{customer.name}</p>
                              <p className="text-xs text-muted-foreground">{customer.phone}</p>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">{customer.email}</td>
                          <td className="p-3 font-semibold">{customer.total_orders}</td>
                          <td className="p-3 font-semibold">Ksh {customer.lifetime_value.toLocaleString()}</td>
                          <td className="p-3">
                            <Badge
                              className={
                                customer.segment === "VIP"
                                  ? "bg-purple-100 text-purple-800"
                                  : customer.segment === "Regular"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                              }
                            >
                              {customer.segment}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">{customer.last_order}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promotions" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-violet-500" />
                  Promotions & Discount Codes
                </CardTitle>
                <CardDescription>Create and manage promotional campaigns and discount codes.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {promotions.map((promo) => (
                    <div key={promo.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <code className="text-sm font-mono font-bold bg-secondary px-2 py-1 rounded">
                            {promo.code}
                          </code>
                          <p className="text-xs text-muted-foreground mt-1">
                            {promo.discount_type === "percentage"
                              ? `${promo.discount_value}% OFF`
                              : `Ksh ${promo.discount_value} OFF`}
                          </p>
                        </div>
                        <Badge className={promo.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {promo.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Usage:</span>
                          <span className="font-medium">{promo.usage_count} times</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expires:</span>
                          <span className="font-medium">{promo.expiry}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full mt-3 bg-transparent">
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-violet-600 hover:bg-violet-700">
                  <Megaphone className="w-4 h-4 mr-2" /> Create New Promotion
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gift-cards" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-fuchsia-500" />
                  Gift Card Management
                </CardTitle>
                <CardDescription>Issue, track, and manage gift cards.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {giftCards.map((card) => (
                    <div
                      key={card.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/20 dark:to-pink-950/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <code className="text-lg font-bold text-fuchsia-600">{card.code}</code>
                          <p className="text-xs text-muted-foreground mt-1">Purchased by {card.purchased_by}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-fuchsia-600">
                            Ksh {card.current_balance.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            of Ksh {card.original_amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Recipient:</span>
                          <span className="font-medium">{card.recipient}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expires:</span>
                          <span className="font-medium">{card.expiry}</span>
                        </div>
                      </div>
                      <Progress value={(card.current_balance / card.original_amount) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-fuchsia-600 hover:bg-fuchsia-700">
                  <Gift className="w-4 h-4 mr-2" /> Issue New Gift Card
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gear className="w-5 h-5 text-slate-500" />
                  System Settings & Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Store Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Store Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Store Name</label>
                      <Input placeholder="Sweet Tooth Bakery" defaultValue="Sweet Tooth Bakery" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Contact Email</label>
                      <Input placeholder="contact@example.com" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Phone Number</label>
                      <Input placeholder="+254712345678" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Physical Address</label>
                      <Input placeholder="Nairobi, Kenya" />
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-lg">Business Hours</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Opening Time</label>
                      <Input type="time" defaultValue="07:00" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Closing Time</label>
                      <Input type="time" defaultValue="18:00" />
                    </div>
                  </div>
                </div>

                {/* Staff Management */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Users2 className="w-5 h-5" /> Staff Members
                  </h3>
                  <div className="space-y-3">
                    {staffMembers.map((staff) => (
                      <div key={staff.id} className="p-3 border rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {staff.role} • {staff.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              staff.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }
                          >
                            {staff.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-slate-600 hover:bg-slate-700">
                    <Users2 className="w-4 h-4 mr-2" /> Add Staff Member
                  </Button>
                </div>

                <div className="border-t pt-4 flex gap-2">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">Save Changes</Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AdminBottomNav />
    </div>
  )
}

export default AdminDashboard
