"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    Home,
    CreditCard,
    Activity,
    Dumbbell,
    Settings,
    QrCode,
    Download,
    Calendar,
    TrendingUp,
    Plus,
    CheckCircle,
    Clock,
} from "lucide-react"

export default function UserDashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("home")

    // Mock user data
    const userData = {
        name: "Alex Johnson",
        membershipType: "Premium",
        membershipExpiry: "2024-12-31",
        membershipStatus: "Active",
        weeklyAttendance: [3, 5, 2, 4, 6, 3, 4], // Last 7 days
        monthlyVisits: 18,
        totalWorkouts: 156,
    }

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const maxAttendance = Math.max(...userData.weeklyAttendance)

    const routines = [
        { id: 1, name: "Upper Body Strength", exercises: 8, duration: "45 min" },
        { id: 2, name: "HIIT Cardio", exercises: 6, duration: "30 min" },
        { id: 3, name: "Leg Day", exercises: 10, duration: "60 min" },
    ]

    const handleLogout = () => {
        localStorage.removeItem("loggedUser")
        navigate("/")
    }

    const navigationItems = [
        { id: "home", icon: Home, label: "Home" },
        { id: "membership", icon: CreditCard, label: "Membership" },
        { id: "activity", icon: Activity, label: "Activity" },
        { id: "routines", icon: Dumbbell, label: "Routines" },
        { id: "settings", icon: Settings, label: "Settings" },
    ]

    return (
        <div className="min-h-screen bg-black text-white pb-20 md:pb-8">
            {/* Header with Logo */}
            <header className="flex justify-between items-center p-6 border-b border-gray-800">
                <div className="flex flex-col">
                    <span className="text-2xl font-normal text-white leading-none">Go</span>
                    <span className="text-2xl font-bold text-[#ff914d] leading-none">GYM</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-300">Welcome back, {userData.name}</span>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="p-6">
                {/* Desktop Layout */}
                <div className="hidden md:grid md:grid-cols-3 gap-6">
                    {/* Left Column - QR Code and Personal Info */}
                    <div className="space-y-6">
                        {/* QR Code Section */}
                        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold mb-4 text-[#ff914d]">Your QR Code</h3>
                            <div className="flex flex-col items-center">
                                <div className="bg-white p-4 rounded-xl mb-4">
                                    <QrCode size={120} className="text-black" />
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-[#ff914d] text-black font-medium rounded-lg hover:bg-orange-400 transition-colors">
                                    <Download size={16} />
                                    Download QR
                                </button>
                            </div>
                        </div>

                        {/* Membership Section */}
                        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold mb-4 text-[#ff914d]">Membership</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Type:</span>
                                    <span className="font-medium">{userData.membershipType}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Expires:</span>
                                    <span className="font-medium">{userData.membershipExpiry}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Status:</span>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-green-500" />
                                        <span className="text-green-500 font-medium">{userData.membershipStatus}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Columns - Activity and Routines */}
                    <div className="col-span-2 space-y-6">
                        {/* My Activity Section */}
                        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold mb-4 text-[#ff914d]">My Activity</h3>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-black/50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar size={20} className="text-[#ff914d]" />
                                        <span className="text-sm text-gray-300">This Month</span>
                                    </div>
                                    <div className="text-2xl font-bold">{userData.monthlyVisits}</div>
                                    <div className="text-xs text-gray-400">Gym visits</div>
                                </div>
                                <div className="bg-black/50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp size={20} className="text-[#ff914d]" />
                                        <span className="text-sm text-gray-300">Total</span>
                                    </div>
                                    <div className="text-2xl font-bold">{userData.totalWorkouts}</div>
                                    <div className="text-xs text-gray-400">Workouts completed</div>
                                </div>
                            </div>

                            {/* Weekly Attendance Chart */}
                            <div>
                                <h4 className="text-sm font-medium mb-3 text-gray-300">Last 7 Days Attendance</h4>
                                <div className="flex items-end gap-2 h-32">
                                    {userData.weeklyAttendance.map((value, index) => (
                                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                            <div
                                                className="w-full bg-[#ff914d] rounded-t-lg transition-all duration-300"
                                                style={{
                                                    height: `${(value / maxAttendance) * 100}%`,
                                                    minHeight: value > 0 ? "8px" : "2px",
                                                    opacity: value > 0 ? 1 : 0.3,
                                                }}
                                            />
                                            <span className="text-xs text-gray-400">{weekDays[index]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Custom Routines Section */}
                        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-[#ff914d]">Custom Routines</h3>
                                <button className="flex items-center gap-2 px-3 py-2 bg-[#ff914d] text-black font-medium rounded-lg hover:bg-orange-400 transition-colors">
                                    <Plus size={16} />
                                    New Routine
                                </button>
                            </div>

                            <div className="space-y-3">
                                {routines.map((routine) => (
                                    <div
                                        key={routine.id}
                                        className="bg-black/50 rounded-xl p-4 hover:bg-black/70 transition-colors cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium">{routine.name}</h4>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Dumbbell size={14} />
                                                        <span>{routine.exercises} exercises</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        <span>{routine.duration}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="text-[#ff914d] hover:text-orange-400">→</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden space-y-6">
                    {/* QR Code Section */}
                    <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 text-[#ff914d]">Your QR Code</h3>
                        <div className="flex flex-col items-center">
                            <div className="bg-white p-4 rounded-xl mb-4">
                                <QrCode size={100} className="text-black" />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#ff914d] text-black font-medium rounded-lg hover:bg-orange-400 transition-colors">
                                <Download size={16} />
                                Download QR
                            </button>
                        </div>
                    </div>

                    {/* Membership Section */}
                    <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 text-[#ff914d]">Membership</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Type:</span>
                                <span className="font-medium">{userData.membershipType}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Expires:</span>
                                <span className="font-medium">{userData.membershipExpiry}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Status:</span>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span className="text-green-500 font-medium">{userData.membershipStatus}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* My Activity Section */}
                    <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 text-[#ff914d]">My Activity</h3>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-black/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={20} className="text-[#ff914d]" />
                                    <span className="text-sm text-gray-300">This Month</span>
                                </div>
                                <div className="text-2xl font-bold">{userData.monthlyVisits}</div>
                                <div className="text-xs text-gray-400">Gym visits</div>
                            </div>
                            <div className="bg-black/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp size={20} className="text-[#ff914d]" />
                                    <span className="text-sm text-gray-300">Total</span>
                                </div>
                                <div className="text-2xl font-bold">{userData.totalWorkouts}</div>
                                <div className="text-xs text-gray-400">Workouts completed</div>
                            </div>
                        </div>

                        {/* Weekly Attendance Chart */}
                        <div>
                            <h4 className="text-sm font-medium mb-3 text-gray-300">Last 7 Days Attendance</h4>
                            <div className="flex items-end gap-2 h-24">
                                {userData.weeklyAttendance.map((value, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-[#ff914d] rounded-t-lg transition-all duration-300"
                                            style={{
                                                height: `${(value / maxAttendance) * 100}%`,
                                                minHeight: value > 0 ? "8px" : "2px",
                                                opacity: value > 0 ? 1 : 0.3,
                                            }}
                                        />
                                        <span className="text-xs text-gray-400">{weekDays[index]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Custom Routines Section */}
                    <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-[#ff914d]">Custom Routines</h3>
                            <button className="flex items-center gap-2 px-3 py-2 bg-[#ff914d] text-black font-medium rounded-lg hover:bg-orange-400 transition-colors">
                                <Plus size={16} />
                                New
                            </button>
                        </div>

                        <div className="space-y-3">
                            {routines.map((routine) => (
                                <div
                                    key={routine.id}
                                    className="bg-black/50 rounded-xl p-4 hover:bg-black/70 transition-colors cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium">{routine.name}</h4>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <Dumbbell size={14} />
                                                    <span>{routine.exercises} exercises</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    <span>{routine.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="text-[#ff914d] hover:text-orange-400">→</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation (Mobile) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-2 md:hidden">
                <div className="flex justify-around items-center">
                    {navigationItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === item.id ? "text-[#ff914d] bg-[#ff914d]/10" : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="text-xs font-medium">{item.label}</span>
                            </button>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
