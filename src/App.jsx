import React, { useState, useEffect } from "react";
import {
  MapPin,
  Star,
  Users,
  MessageSquare,
  Plus,
  RotateCcw,
  Trophy,
  Clock,
} from "lucide-react";

const LunchRoulette = () => {
  const [restaurants, setRestaurants] = useState([]);

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState("roulette");
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    category: "",
    distance: "",
  });
  const [newReview, setNewReview] = useState({
    restaurantId: null,
    user: "",
    rating: 5,
    comment: "",
  });

  const categories = [
    "한식",
    "양식",
    "일식",
    "중식",
    "아시안",
    "패스트푸드",
    "기타",
  ];

  const spinRoulette = () => {
    setIsSpinning(true);
    setSelectedRestaurant(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * restaurants.length);
      setSelectedRestaurant(restaurants[randomIndex]);
      setIsSpinning(false);
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
              updatedReviews.reduce((sum, review) => sum + review.rating, 0) /
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
      prev.map((restaurant) =>
        restaurant.id === restaurantId
          ? { ...restaurant, votes: restaurant.votes + 1 }
          : restaurant
      )
    );
  };

  const deleteRestaurant = (restaurantId) => {
    setRestaurants((prev) =>
      prev.filter((restaurant) => restaurant.id !== restaurantId)
    );
  };

  const clearAllData = () => {
    if (
      window.confirm(
        "정말로 모든 맛집 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      setRestaurants([]);
      setSelectedRestaurant(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            OGQ 점심 메뉴 룰렛
          </h1>
          <p className="text-gray-600">
            오늘 점심 뭐 먹을지 고민될 때 룰렛 돌리고 빨랑 갑시다
          </p>
        </header>

        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-lg p-2 flex">
            {["roulette", "restaurants", "rankings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab === "roulette" && "룰렛"}
                {tab === "restaurants" && "🍽맛집 목록"}
                {tab === "rankings" && "인기 순위"}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "roulette" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {restaurants.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  등록된 맛집이 없습니다
                </h3>
                <p className="text-gray-500 mb-6">먼저 맛집을 등록해주세요!</p>
                <button
                  onClick={() => setActiveTab("restaurants")}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105"
                    }`}
                  >
                    {isSpinning ? (
                      <>
                        <RotateCcw
                          className="inline-block mr-2 animate-spin"
                          size={20}
                        />
                        돌리는 중...
                      </>
                    ) : (
                      "🎲 룰렛 돌리기"
                    )}
                  </button>
                </div>

                {selectedRestaurant && !isSpinning && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-green-700 mb-2">
                        🎉 오늘의 점심은!
                      </h3>
                      <div className="bg-white rounded-lg p-4 shadow-md">
                        <h4 className="text-xl font-bold text-gray-800 mb-2">
                          {selectedRestaurant.name}
                        </h4>
                        <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
                          <span className="bg-blue-100 px-3 py-1 rounded-full">
                            {selectedRestaurant.category}
                          </span>
                          <span className="flex items-center">
                            <MapPin size={16} className="mr-1" />
                            {selectedRestaurant.distance}
                          </span>
                          <span className="flex items-center">
                            <Star size={16} className="mr-1 text-yellow-500" />
                            {selectedRestaurant.rating}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => voteForRestaurant(selectedRestaurant.id)}
                        className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
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

        {activeTab === "restaurants" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">맛집 목록</h2>
              <div className="flex space-x-2">
                {restaurants.length > 0 && (
                  <button
                    onClick={clearAllData}
                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    🗑️ 전체 삭제
                  </button>
                )}
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  맛집 추가
                </button>
              </div>
            </div>

            {showAddForm && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">새 맛집 등록</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="가게 이름"
                    value={newRestaurant.name}
                    onChange={(e) =>
                      setNewRestaurant({
                        ...newRestaurant,
                        name: e.target.value,
                      })
                    }
                    className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newRestaurant.category}
                    onChange={(e) =>
                      setNewRestaurant({
                        ...newRestaurant,
                        category: e.target.value,
                      })
                    }
                    className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="거리 (예: 도보 5분)"
                    value={newRestaurant.distance}
                    onChange={(e) =>
                      setNewRestaurant({
                        ...newRestaurant,
                        distance: e.target.value,
                      })
                    }
                    className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={addRestaurant}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    등록
                  </button>
                </div>
              </div>
            )}

            {restaurants.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  등록된 맛집이 없습니다
                </h3>
                <p className="text-gray-500 mb-6">
                  첫 번째 맛집을 등록해보세요!
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  맛집 등록하기
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="bg-blue-100 px-3 py-1 rounded-full">
                            {restaurant.category}
                          </span>
                          <span className="flex items-center">
                            <MapPin size={16} className="mr-1" />
                            {restaurant.distance}
                          </span>
                          <span className="flex items-center">
                            <Star size={16} className="mr-1 text-yellow-500" />
                            {restaurant.rating}
                          </span>
                          <span className="flex items-center">
                            <Users size={16} className="mr-1" />
                            {restaurant.votes}표
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => voteForRestaurant(restaurant.id)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                        >
                          👍 추천
                        </button>
                        <button
                          onClick={() => deleteRestaurant(restaurant.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                        >
                          🗑️ 삭제
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-700 flex items-center">
                        <MessageSquare size={16} className="mr-2" />
                        리뷰 ({restaurant.reviews.length})
                      </h4>

                      {restaurant.reviews.map((review, index) => (
                        <div key={index} className="bg-gray-50 rounded-md p-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-gray-700">
                              {review.user}
                            </span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i < review.rating
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {review.comment}
                          </p>
                        </div>
                      ))}

                      <div className="bg-blue-50 rounded-md p-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <input
                            type="text"
                            placeholder="작성자"
                            value={
                              newReview.restaurantId === restaurant.id
                                ? newReview.user
                                : ""
                            }
                            onChange={(e) =>
                              setNewReview({
                                ...newReview,
                                restaurantId: restaurant.id,
                                user: e.target.value,
                              })
                            }
                            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <select
                            value={
                              newReview.restaurantId === restaurant.id
                                ? newReview.rating
                                : 5
                            }
                            onChange={(e) =>
                              setNewReview({
                                ...newReview,
                                restaurantId: restaurant.id,
                                rating: parseInt(e.target.value),
                              })
                            }
                            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <option key={rating} value={rating}>
                                {rating}점
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="리뷰 작성"
                            value={
                              newReview.restaurantId === restaurant.id
                                ? newReview.comment
                                : ""
                            }
                            onChange={(e) =>
                              setNewReview({
                                ...newReview,
                                restaurantId: restaurant.id,
                                comment: e.target.value,
                              })
                            }
                            className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => addReview(restaurant.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                          >
                            리뷰 등록
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "rankings" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Trophy className="mr-3 text-yellow-500" />
              인기 랭킹
            </h2>
            <div className="space-y-4">
              {restaurants
                .sort((a, b) => b.votes - a.votes)
                .map((restaurant, index) => (
                  <div
                    key={restaurant.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      index === 0
                        ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200"
                        : index === 1
                        ? "bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200"
                        : index === 2
                        ? "bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                            ? "bg-gray-400"
                            : index === 2
                            ? "bg-orange-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {restaurant.name}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span>{restaurant.category}</span>
                          <span className="flex items-center">
                            <Star size={14} className="mr-1 text-yellow-500" />
                            {restaurant.rating}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare size={14} className="mr-1" />
                            리뷰 {restaurant.reviews.length}개
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {restaurant.votes}
                      </div>
                      <div className="text-sm text-gray-500">추천</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LunchRoulette;
