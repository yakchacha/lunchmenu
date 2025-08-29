import React, { useState } from "react";
import {
  MapPin,
  Star,
  Users,
  MessageSquare,
  Plus,
  RotateCcw,
  Coffee,
} from "lucide-react";

const App = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [coffeeMembers, setCoffeeMembers] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedCoffeeMembers, setSelectedCoffeeMembers] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isCoffeeSpinning, setIsCoffeeSpinning] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [activeTab, setActiveTab] = useState("roulette");
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    category: "",
    distance: "",
  });
  const [newMember, setNewMember] = useState("");
  const [newReview, setNewReview] = useState({
    restaurantId: null,
    user: "",
    rating: 5,
    comment: "",
  });

  const categories = ["한식", "양식", "일식", "중식", "아시안", "패스트푸드", "기타"];

  const spinRoulette = () => {
    if (restaurants.length === 0) return;
    setIsSpinning(true);
    setSelectedRestaurant(null);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * restaurants.length);
      setSelectedRestaurant(restaurants[randomIndex]);
      setIsSpinning(false);
    }, 2000);
  };

  const spinCoffeeRoulette = () => {
    if (coffeeMembers.length < 2) {
      alert("최소 2명 이상의 멤버가 필요합니다!");
      return;
    }
    setIsCoffeeSpinning(true);
    setSelectedCoffeeMembers([]);
    setTimeout(() => {
      const shuffled = [...coffeeMembers].sort(() => Math.random() - 0.5);
      const numSelected = Math.floor(
        Math.random() * Math.min(3, coffeeMembers.length - 1)
      ) + 1;
      setSelectedCoffeeMembers(shuffled.slice(0, numSelected));
      setIsCoffeeSpinning(false);
    }, 2000);
  };

  const addRestaurant = () => {
    if (newRestaurant.name && newRestaurant.category) {
      const restaurant = {
        id: Date.now(),
        ...newRestaurant,
        rating: 0,
        reviews: [],
        votes: 0,
      };
      setRestaurants([...restaurants, restaurant]);
      setNewRestaurant({ name: "", category: "", distance: "" });
      setShowAddForm(false);
    }
  };

  const addMember = () => {
    if (newMember.trim() && !coffeeMembers.includes(newMember.trim())) {
      setCoffeeMembers([...coffeeMembers, newMember.trim()]);
      setNewMember("");
      setShowAddMemberForm(false);
    }
  };

  const removeMember = (memberToRemove) => {
    setCoffeeMembers(coffeeMembers.filter((m) => m !== memberToRemove));
  };

  const addReview = (restaurantId) => {
    if (newReview.user && newReview.comment) {
      setRestaurants((prev) =>
        prev.map((restaurant) => {
          if (restaurant.id === restaurantId) {
            const updatedReviews = [
              ...restaurant.reviews,
              {
                user: newReview.user,
                rating: newReview.rating,
                comment: newReview.comment,
              },
            ];
            const avgRating =
              updatedReviews.reduce((sum, r) => sum + r.rating, 0) /
              updatedReviews.length;
            return {
              ...restaurant,
              reviews: updatedReviews,
              rating: Math.round(avgRating * 10) / 10,
            };
          }
          return restaurant;
        })
      );
      setNewReview({ restaurantId: null, user: "", rating: 5, comment: "" });
    }
  };

  const voteForRestaurant = (restaurantId) => {
    setRestaurants((prev) =>
      prev.map((r) =>
        r.id === restaurantId ? { ...r, votes: r.votes + 1 } : r
      )
    );
  };

  const deleteRestaurant = (restaurantId) => {
    setRestaurants((prev) => prev.filter((r) => r.id !== restaurantId));
  };

  const clearAllData = () => {
    if (window.confirm("모든 맛집 데이터를 삭제하시겠습니까?")) {
      setRestaurants([]);
      setSelectedRestaurant(null);
    }
  };

  const clearAllMembers = () => {
    if (window.confirm("모든 멤버를 삭제하시겠습니까?")) {
      setCoffeeMembers([]);
      setSelectedCoffeeMembers([]);
    }
  };

  const RouletteWheel = () => (
    <div className="relative w-80 h-80 mx-auto mb-8">
      <div
        className={`w-full h-full rounded-full border-8 border-blue-500 relative overflow-hidden ${
          isSpinning ? "animate-spin" : ""
        }`}
      >
        {restaurants.map((restaurant, index) => {
          const angle = (360 / restaurants.length) * index;
          const nextAngle = (360 / restaurants.length) * (index + 1);
          const midAngle = (angle + nextAngle) / 2;
          const colors = [
            "bg-red-400",
            "bg-blue-400",
            "bg-green-400",
            "bg-yellow-400",
            "bg-purple-400",
            "bg-pink-400",
            "bg-indigo-400",
            "bg-orange-400",
          ];
          return (
            <div
              key={restaurant.id}
              className={`absolute w-full h-full ${
                colors[index % colors.length]
              }`}
              style={{
                clipPath: `polygon(50% 50%, ${
                  50 + 50 * Math.cos((angle * Math.PI) / 180)
                }% ${50 + 50 * Math.sin((angle * Math.PI) / 180)}%, ${
                  50 + 50 * Math.cos((nextAngle * Math.PI) / 180)
                }% ${50 + 50 * Math.sin((nextAngle * Math.PI) / 180)}%)`,
              }}
            >
              <div
                className="absolute text-white font-bold text-sm whitespace-nowrap"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%) rotate(${midAngle}deg) translateY(-80px)`,
                  transformOrigin: "center",
                }}
              >
                {restaurant.name}
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
        <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-600"></div>
      </div>
    </div>
  );

  const CoffeeRouletteWheel = () => (
    <div className="relative w-80 h-80 mx-auto mb-8">
      <div
        className={`w-full h-full rounded-full border-8 border-orange-500 relative overflow-hidden ${
          isCoffeeSpinning ? "animate-spin" : ""
        }`}
      >
        {coffeeMembers.map((member, index) => {
          const angle = (360 / coffeeMembers.length) * index;
          const nextAngle = (360 / coffeeMembers.length) * (index + 1);
          const midAngle = (angle + nextAngle) / 2;
          const colors = [
            "bg-orange-400",
            "bg-yellow-400",
            "bg-amber-400",
            "bg-red-400",
            "bg-pink-400",
            "bg-rose-400",
            "bg-purple-400",
            "bg-indigo-400",
          ];
          return (
            <div
              key={member}
              className={`absolute w-full h-full ${
                colors[index % colors.length]
              }`}
              style={{
                clipPath: `polygon(50% 50%, ${
                  50 + 50 * Math.cos((angle * Math.PI) / 180)
                }% ${50 + 50 * Math.sin((angle * Math.PI) / 180)}%, ${
                  50 + 50 * Math.cos((nextAngle * Math.PI) / 180)
                }% ${50 + 50 * Math.sin((nextAngle * Math.PI) / 180)}%)`,
              }}
            >
              <div
                className="absolute text-white font-bold text-sm whitespace-nowrap"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%) rotate(${midAngle}deg) translateY(-80px)`,
                  transformOrigin: "center",
                }}
              >
                {member.length > 8 ? member.substring(0, 6) + ".." : member}
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
        <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-600"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="mb-4">
            <img
              src="https://i.imgur.com/EPQTCHV.png"
              alt="OGQ 로고"
              className="w-24 h-24 mx-auto rounded-full shadow-lg object-cover"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            OGQ 점심 메뉴 & 커피 룰렛
          </h1>
        </header>

        {/* 탭 메뉴 */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-lg p-2 flex flex-wrap">
            {["roulette", "coffee", "restaurants", "rankings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md font-medium transition-colors m-1 ${
                  activeTab === tab
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab === "roulette" && "🎯 룰렛"}
                {tab === "coffee" && "☕ 커피내기"}
                {tab === "restaurants" && "🍽️ 맛집 목록"}
                {tab === "rankings" && "🏆 인기 순위"}
              </button>
            ))}
          </div>
        </div>

        {/* 점심 룰렛 탭 */}
        {activeTab === "roulette" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {restaurants.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-gray-500 mb-6">맛집을 등록해주세요!</p>
                <button
                  onClick={() => setActiveTab("restaurants")}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  맛집 등록하러 가기
                </button>
              </div>
            ) : (
              <>
                <RouletteWheel />
                <div className="text-center mb-6">
                  <button
                    onClick={spinRoulette}
                    disabled={isSpinning}
                    className={`px-8 py-4 rounded-full font-bold text-white text-lg transition-all ${
                      isSpinning
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    }`}
                  >
                    {isSpinning ? "돌리는 중..." : "🎲 룰렛 돌리기"}
                  </button>
                </div>
                {selectedRestaurant && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-green-700 mb-2">
                        오늘의 점심은!
                      </h3>
                      <h4 className="text-xl font-bold">{selectedRestaurant.name}</h4>
                      <button
                        onClick={() => voteForRestaurant(selectedRestaurant.id)}
                        className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        👍 개추
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 커피 내기 룰렛 탭 */}
        {activeTab === "coffee" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Coffee className="mr-3 text-orange-500" /> 커피 내기 룰렛
              </h2>
              <div className="flex space-x-2">
                {coffeeMembers.length > 0 && (
                  <button
                    onClick={clearAllMembers}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    🗑️ 전체 삭제
                  </button>
                )}
                <button
                  onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  <Plus size={20} className="mr-2" /> 멤버 추가
                </button>
              </div>
            </div>

            {showAddMemberForm && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <input
                  type="text"
                  placeholder="멤버 이름"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                />
                <button onClick={addMember} className="ml-2 px-4 py-2 bg-orange-500 text-white rounded-md">
                  등록
                </button>
              </div>
            )}

            {coffeeMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">☕</div>
                <p className="text-gray-500">멤버를 등록해주세요!</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  {coffeeMembers.map((m) => (
                    <span
                      key={m}
                      className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm m-1"
                    >
                      {m}
                      <button
                        onClick={() => removeMember(m)}
                        className="ml-2 text-orange-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <CoffeeRouletteWheel />
                <div className="text-center mb-6">
                  <button
                    onClick={spinCoffeeRoulette}
                    disabled={isCoffeeSpinning || coffeeMembers.length < 2}
                    className={`px-8 py-4 rounded-full font-bold text-white text-lg transition-all ${
                      isCoffeeSpinning
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700"
                    }`}
                  >
                    {isCoffeeSpinning ? "돌리는 중..." : "☕ 룰렛 돌리기"}
                  </button>
                </div>
                {selectedCoffeeMembers.length > 0 && (
                  <div className="bg-gradient-to-r from-yellow-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
                    <h3 className="text-xl font-bold text-orange-700 mb-2 text-center">
                      오늘의 커피 당첨자 🎉
                    </h3>
                    <ul className="text-center">
                      {selectedCoffeeMembers.map((m) => (
                        <li key={m} className="font-medium text-lg">{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 맛집 목록 탭 */}
        {activeTab === "restaurants" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">🍽️ 맛집 목록</h2>
              <div className="flex space-x-2">
                {restaurants.length > 0 && (
                  <button
                    onClick={clearAllData}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    🗑️ 전체 삭제
                  </button>
                )}
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Plus size={20} className="mr-2" /> 맛집 추가
                </button>
              </div>
            </div>

            {showAddForm && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <input
                  type="text"
                  placeholder="맛집 이름"
                  value={newRestaurant.name}
                 
