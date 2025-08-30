import React, { useState, useEffect } from "react";
import {
  MapPin,
  Star,
  Users,
  MessageSquare,
  Plus,
  RotateCcw,
  Trophy,
  Coffee,
  Wifi,
  WifiOff,
  X,
  Utensils,
  Target,
} from "lucide-react";

// Firebase imports 추가
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc,
  updateDoc,
  getDocs 
} from 'firebase/firestore';

const LunchRoulette = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [coffeeMembers, setCoffeeMembers] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedCoffeeMembers, setSelectedCoffeeMembers] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isCoffeeSpinning, setIsCoffeeSpinning] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [activeTab, setActiveTab] = useState("roulette");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    category: "",
    distance: "",
    naverMapUrl: "",
  });
  const [newMember, setNewMember] = useState("");
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

  const [filterCategory, setFilterCategory] = useState("");

  const [coffeeWinHistory, setCoffeeWinHistory] = useState([]);

  const confirmCoffeeWinner = async () => {
    if (!isOnline) {
      alert('오프라인 상태입니다.');
      return;
    }

  setIsSyncing(true);
  try {
    const winRecord = {
      winners: selectedCoffeeMembers,
      date: new Date().toISOString(),
      confirmed: true
    };
    
    // Firebase에 당첨 기록 저장
    await addDoc(collection(db, 'coffee-wins'), winRecord);
    
    // 로컬 상태 업데이트
    setCoffeeWinHistory(prev => [...prev, winRecord]);
    
  } catch (error) {
    console.error('당첨 확정 실패:', error);
    alert('확정에 실패했습니다.');
  } finally {
    setIsSyncing(false);
  }
};

  // Firebase 실시간 동기화 및 초기 설정
  useEffect(() => {
    // 맛집 데이터 실시간 동기화
    const unsubscribeRestaurants = onSnapshot(
      collection(db, 'restaurants'), 
      (snapshot) => {
        const restaurantList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRestaurants(restaurantList);
      },
      (error) => {
        console.error('실시간 동기화 오류:', error);
      }
    );

    // 멤버 데이터 실시간 동기화
    const unsubscribeMembers = onSnapshot(
      collection(db, 'members'), 
      (snapshot) => {
        const memberList = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        }));
        setCoffeeMembers(memberList.map(member => member.name));
      },
      (error) => {
        console.error('멤버 동기화 오류:', error);
      }
    );

    // 커피 당첨 기록 실시간 동기화
    const unsubscribeCoffeeWins = onSnapshot(
      collection(db, 'coffee-wins'), 
      (snapshot) => {
        const winsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCoffeeWinHistory(winsList);
      },
      (error) => {
        console.error('커피 당첨 기록 동기화 오류:', error);
      }
    );

    // 온라인/오프라인 상태 감지
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      unsubscribeRestaurants();
      unsubscribeMembers();
      unsubscribeCoffeeWins();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const spinRoulette = () => {
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
      const numSelected = 1;
      setSelectedCoffeeMembers(shuffled.slice(0, numSelected));
      setIsCoffeeSpinning(false);
    }, 2000);
  };

  // 맛집 추가 함수 (Firebase 연동)
  const addRestaurant = async () => {
    if (newRestaurant.name && newRestaurant.category) {
      if (!isOnline) {
        alert('오프라인 상태입니다. 인터넷 연결을 확인해주세요.');
        return;
      }
      
      setIsSyncing(true);
      try {
        const restaurant = {
          ...newRestaurant,
          rating: 0,
          reviews: [],
          votes: 0,
          createdAt: new Date().toISOString(),
        };
        
        // Firebase에 실제 저장
        await addDoc(collection(db, 'restaurants'), restaurant);
        
        setNewRestaurant({ name: "", category: "", distance: "", naverMapUrl: "" });
        setShowAddForm(false);
        
      } catch (error) {
        console.error('맛집 추가 실패:', error);
        alert('데이터 저장에 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // 멤버 추가 함수 (Firebase 연동)
  const addMember = async () => {
    if (newMember.trim() && !coffeeMembers.includes(newMember.trim())) {
      if (!isOnline) {
        alert('오프라인 상태입니다.');
        return;
      }
      
      setIsSyncing(true);
      try {
        // Firebase에 실제 저장
        await addDoc(collection(db, 'members'), {
          name: newMember.trim(),
          createdAt: new Date().toISOString()
        });
        
        setNewMember("");
        setShowAddMemberForm(false);
        
      } catch (error) {
        console.error('멤버 추가 실패:', error);
        alert('데이터 저장에 실패했습니다.');
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // 멤버 삭제 함수 (Firebase 연동)
  const removeMember = async (memberToRemove) => {
    if (!isOnline) {
      alert('오프라인 상태입니다.');
      return;
    }

    setIsSyncing(true);
    try {
      // Firebase에서 해당 멤버 찾아서 삭제
      const membersSnapshot = await getDocs(collection(db, 'members'));
      const memberDoc = membersSnapshot.docs.find(doc => doc.data().name === memberToRemove);
      
      if (memberDoc) {
        await deleteDoc(doc(db, 'members', memberDoc.id));
      }
    } catch (error) {
      console.error('멤버 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setIsSyncing(false);
    }
  };

  // 리뷰 추가 함수 (Firebase 연동)
  const addReview = async (restaurantId) => {
    if (newReview.user && newReview.comment) {
      if (!isOnline) {
        alert('오프라인 상태입니다.');
        return;
      }

      setIsSyncing(true);
      try {
        const restaurant = restaurants.find(r => r.id === restaurantId);
        const updatedReviews = [
          ...restaurant.reviews,
          {
            user: newReview.user,
            rating: newReview.rating,
            comment: newReview.comment,
            createdAt: new Date().toISOString(),
          },
        ];
        const avgRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0) / updatedReviews.length;
        
        // Firebase 업데이트
        await updateDoc(doc(db, 'restaurants', restaurantId), {
          reviews: updatedReviews,
          rating: Math.round(avgRating * 10) / 10,
        });
        
        setNewReview({ restaurantId: null, user: "", rating: 5, comment: "" });
      } catch (error) {
        console.error('리뷰 추가 실패:', error);
        alert('리뷰 저장에 실패했습니다.');
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // 추천 투표 함수 (Firebase 연동)
  const voteForRestaurant = async (restaurantId) => {
    if (!isOnline) {
      alert('오프라인 상태입니다.');
      return;
    }

    setIsSyncing(true);
    try {
      const restaurant = restaurants.find(r => r.id === restaurantId);
      await updateDoc(doc(db, 'restaurants', restaurantId), {
        votes: restaurant.votes + 1
      });
    } catch (error) {
      console.error('투표 실패:', error);
      alert('투표에 실패했습니다.');
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteReview = async (restaurantId, reviewIndex) => {
    if (confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      if (!isOnline) {
        alert('오프라인 상태입니다.');
        return;
      }
  
      setIsSyncing(true);
      try {
        const restaurant = restaurants.find(r => r.id === restaurantId);
        const updatedReviews = restaurant.reviews.filter((_, index) => index !== reviewIndex);
        const avgRating = updatedReviews.length > 0 
          ? updatedReviews.reduce((sum, review) => sum + review.rating, 0) / updatedReviews.length
          : 0;
        
        // Firebase 업데이트
        await updateDoc(doc(db, 'restaurants', restaurantId), {
          reviews: updatedReviews,
          rating: Math.round(avgRating * 10) / 10,
        });
        
      } catch (error) {
        console.error('리뷰 삭제 실패:', error);
        alert('삭제에 실패했습니다.');
      } finally {
        setIsSyncing(false);
      }
    }
  };
      

  // 맛집 삭제 함수 (Firebase 연동)
  const deleteRestaurant = async (restaurantId) => {
    if (confirm('정말로 이 맛집을 삭제하시겠습니까?')) {
      if (!isOnline) {
        alert('오프라인 상태입니다.');
        return;
      }

      setIsSyncing(true);
      try {
        await deleteDoc(doc(db, 'restaurants', restaurantId));
      } catch (error) {
        console.error('삭제 실패:', error);
        alert('삭제에 실패했습니다.');
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // 전체 맛집 삭제 함수 (Firebase 연동)
  const clearAllData = async () => {
    if (window.confirm("정말로 모든 맛집 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      if (!isOnline) {
        alert('오프라인 상태입니다.');
        return;
      }

      setIsSyncing(true);
      try {
        const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
        const deletePromises = restaurantsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        setSelectedRestaurant(null);
      } catch (error) {
        console.error('전체 삭제 실패:', error);
        alert('삭제에 실패했습니다.');
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // 전체 팀원 삭제 함수 (Firebase 연동)
  const clearAllMembers = async () => {
    if (window.confirm("정말로 모든 팀원을 삭제하시겠습니까?")) {
      if (!isOnline) {
        alert('오프라인 상태입니다.');
        return;
      }

      setIsSyncing(true);
      try {
        const membersSnapshot = await getDocs(collection(db, 'members'));
        const deletePromises = membersSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        setSelectedCoffeeMembers([]);
      } catch (error) {
        console.error('전체 팀원 삭제 실패:', error);
        alert('삭제에 실패했습니다.');
      } finally {
        setIsSyncing(false);
      }
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
            "bg-teal-400",
            "bg-emerald-400",
            "bg-green-400",
            "bg-cyan-400",
            "bg-sky-400",
            "bg-blue-400",
            "bg-indigo-400",
            "bg-purple-400",
            "bg-violet-400",
            "bg-lime-400",
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
        className={`w-full h-full rounded-full border-8 border-teal-500 relative overflow-hidden ${
          isCoffeeSpinning ? "animate-spin" : ""
        }`}
      >
        {coffeeMembers.map((member, index) => {
          const angle = (360 / coffeeMembers.length) * index;
          const nextAngle = (360 / coffeeMembers.length) * (index + 1);
          const midAngle = (angle + nextAngle) / 2;

          const colors = [
            "bg-teal-400",
            "bg-emerald-400",
            "bg-green-400",
            "bg-cyan-400",
            "bg-lime-400",
            "bg-slate-400",
            "bg-zinc-400",
            "bg-stone-400",
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
                {member.length > 8 ? member.substring(0, 6) + '...' : member}
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="mb-4 relative">
            <img 
              src="https://i.imgur.com/EPQTCHV.png" 
              alt="OGQ 로고" 
              className="w-24 h-24 mx-auto rounded-full shadow-lg object-cover"
            />
            {/* 연결 상태 표시 */}
            <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
              isOnline ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {isOnline ? 
                <Wifi size={12} className="text-white" /> : 
                <WifiOff size={12} className="text-white" />
              }
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            OGQ 점심 룰렛
          </h1>
          <p className="text-gray-600">
            점메추도 커피 내기도 OGQ와 함께 한큐에 끝내자
          </p>
          {!isOnline && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 inline-block">
              오프라인 상태 - 데이터가 동기화되지 않습니다
            </div>
          )}
          {isSyncing && (
            <div className="mt-2 text-sm text-blue-600 bg-blue-50 rounded-lg px-3 py-2 inline-block">
              데이터 동기화 중...
            </div>
          )}
        </header>

        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-lg p-2 flex flex-wrap justify-center max-w-full">
            {["roulette", "coffee", "restaurants", "rankings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-md font-medium transition-colors m-1 text-sm md:text-base md:px-4 ${
                  activeTab === tab
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab === "roulette" && "🎯 점심 룰렛"}
                {tab === "coffee" && "☕ 커피 내기"}
                {tab === "restaurants" && "🍽️ 맛집 목록"}
                {tab === "rankings" && "🏆 인기 순위"}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "roulette" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Target className="mr-2 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-800">점심 룰렛</h2>
              </div>
            </div>
            
            <div className="text-center text-gray-600 text-sm mb-8">
              <p>오늘 점심 뭐 먹음?</p>
              <p>맛집 목록에 있는 맛집들 중 하나를 추첨합니다.</p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="border-t-2 border-gray-200 w-24"></div>
            </div>
            
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
              <div>
                <RouletteWheel />

                  <div className="text-center mb-6">
                    <button
                      onClick={spinRoulette}
                      disabled={isSpinning}
                      className={`px-8 py-4 rounded-full font-bold text-white text-lg transition-all ${isSpinning ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105"}`}
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
                        오늘의 점심 메뉴
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
                            {selectedRestaurant.naverMapUrl && (
                              <a
                                href={selectedRestaurant.naverMapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-500 hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1 rounded-full"
                              >
                                <MapPin size={16} className="mr-1" />
                                네이버지도
                              </a>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "coffee" && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Coffee className="mr-3 text-teal-500" />
                커피 내기
              </h2>
              <div className="flex space-x-2">
                {coffeeMembers.length > 0 && (
                  <button
                    onClick={clearAllMembers}
                    className="flex items-center px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm bg-red-500 text-white rounded-md md:rounded-lg hover:bg-red-600 transition-colors"
                    disabled={!isOnline}
                  >
                    <X size={16} className="mr-2" />
                    <span className="hidden md:inline">전체 삭제</span>
                    <span className="md:hidden flex flex-col text-center leading-tight">
                      <span>전체</span>
                      <span>삭제</span>
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                  className="flex items-center px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm bg-blue-500 text-white rounded-md md:rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={!isOnline}
                >
                  <Plus size={16} className="mr-2" />
                    <span className="hidden md:inline">팀원 추가</span>
                    <span className="md:hidden flex flex-col text-center leading-tight">
                      <span>팀원</span>
                      <span>추가</span>
                    </span>
                </button>
              </div>
            </div>

            {showAddMemberForm && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">새 멤버 등록</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="팀원 이름"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addMember()}
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={!isOnline}
                  />
                  <button
                    onClick={() => setShowAddMemberForm(false)}
                    className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={addMember}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400"
                    disabled={!isOnline || isSyncing}
                  >
                    {isSyncing ? '저장중...' : '등록'}
                  </button>
                </div>
              </div>
            )}

            {coffeeMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">☕</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  등록된 팀원이 없습니다
                </h3>
                <p className="text-gray-500 mb-6">
                  커피 내기에 참여할 팀원들을 등록해주세요!
                </p>
                <button
                  onClick={() => setShowAddMemberForm(true)}
                  className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors disabled:bg-gray-400"
                  disabled={!isOnline}
                >
                  팀원 등록하기
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">참여 팀원 ({coffeeMembers.length}명)</h3>
                  <div className="flex flex-wrap gap-2">
                    {coffeeMembers.map((member) => (
                      <span
                        key={member}
                        className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {member}
                        <button
                          onClick={() => removeMember(member)}
                          className="ml-2 text-teal-600 hover:text-teal-800 disabled:opacity-50"
                          disabled={!isOnline}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <CoffeeRouletteWheel />

                <div className="text-center mb-6">
                  <button
                    onClick={spinCoffeeRoulette}
                    disabled={isCoffeeSpinning || coffeeMembers.length < 2}
                    className={`px-8 py-4 rounded-full font-bold text-white text-lg transition-all ${
                      isCoffeeSpinning || coffeeMembers.length < 2
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 transform hover:scale-105"
                    }`}
                  >
                    {isCoffeeSpinning ? (
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

                {selectedCoffeeMembers.length > 0 && !isCoffeeSpinning && (
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-6 border-2 border-teal-200">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-teal-700 mb-2">
                        오늘 커피 쏘신 분은
                      </h3>
                      <div className="bg-white rounded-lg p-4 shadow-md">
                        <div className="flex flex-wrap justify-center gap-2">
                          {selectedCoffeeMembers.map((member) => (
                            <span
                              key={member}
                              className="bg-teal-500 text-white px-4 py-2 rounded-full font-bold text-lg"
                            >
                              {member}
                            </span>
                          ))}
                        </div>
                        <p className="text-gray-600 mt-3">
                          모두들 감사하십시오
                        </p>
                      </div>
                      <button
                        onClick={confirmCoffeeWinner}
                        disabled={!isOnline || isSyncing}
                        className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400"
                      >
                        {isSyncing ? '확정 중...' : '확정'}
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
              <div className="flex items-center">
                <Utensils className="mr-3 text-teal-500" />
                <h2 className="text-2xl font-bold text-gray-800">맛집 목록</h2>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center px-2 py-1 text-xs md:px-4 md:py-2 md:text-sm bg-blue-500 text-white rounded-md md:rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                  disabled={!isOnline}
                >
                  <Plus size={16} className="mr-2" />
                    <span className="hidden md:inline">맛집 추가</span>
                    <span className="md:hidden flex flex-col text-center leading-tight">
                      <span>맛집</span>
                      <span>추가</span>
                    </span>
                </button>
              </div>
            </div>

            {/* 카테고리 필터 */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">카테고리별 보기:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">전체</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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
                  <input
                    type="url"
                    placeholder="네이버지도 링크 (선택사항)"
                    value={newRestaurant.naverMapUrl}
                    onChange={(e) =>
                      setNewRestaurant({
                        ...newRestaurant,
                        naverMapUrl: e.target.value,
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
                {restaurants
                  .filter(restaurant => filterCategory === "" || restaurant.category === filterCategory)
                  .map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="border rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 space-y-4 md:space-y-0">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 break-words">
                          {restaurant.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-2 md:flex md:items-center md:space-x-4 md:gap-0 text-sm text-gray-600">
                          <span className="bg-blue-100 px-3 py-1 rounded-full text-center">
                            {restaurant.category}
                          </span>
                          <span className="flex items-center justify-center md:justify-start">
                            <MapPin size={16} className="mr-1" />
                            {restaurant.distance}
                          </span>
                          <span className="flex items-center justify-center md:justify-start">
                            <Star size={16} className="mr-1 text-yellow-500" />
                            {restaurant.rating}
                          </span>
                          <span className="flex items-center justify-center md:justify-start">
                            <Users size={16} className="mr-1" />
                            {restaurant.votes}표
                          </span>
                          {restaurant.naverMapUrl && (
                            <div className="col-span-2 flex justify-center md:col-span-1">
                              <a
                                href={restaurant.naverMapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-500 hover:text-blue-700 transition-colors"
                              >
                                <MapPin size={14} className="mr-1" />
                                지도보기
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 justify-center md:justify-start">
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
                        <div key={index} className="bg-gray-50 rounded-md p-3 relative">
                          <button
                            onClick={() => deleteReview(restaurant.id, index)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                            disabled={!isOnline}
                          >
                            ×
                          </button>
                          <div className="flex justify-between items-start mb-1 pr-6">
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
            
            {/* 맛집 랭킹 */}
            <h3 className="text-lg font-bold text-gray-700 mb-4">맛집 랭킹</h3>
            <div className="space-y-4 mb-8">
              {restaurants
                .sort((a, b) => b.votes - a.votes)
                .slice(0, 5)
                .map((restaurant, index) => (
                  <div key={restaurant.id} className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0 ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200" :
                    index === 1 ? "bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200" :
                    index === 2 ? "bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200" :
                    "bg-gray-50"
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? "bg-yellow-500" :
                        index === 1 ? "bg-gray-400" :
                        index === 2 ? "bg-orange-500" :
                        "bg-gray-300"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{restaurant.name}</h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span>{restaurant.category}</span>
                          <span className="flex items-center">
                            <Star size={14} className="mr-1 text-yellow-500" />
                            {restaurant.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{restaurant.votes}</div>
                      <div className="text-sm text-gray-500">추천</div>
                    </div>
                  </div>
                ))}
            </div>
        
            {/* 커피 쏘신 분 랭킹 */}
            <h3 className="text-lg font-bold text-gray-700 mb-4">커피 쏘신 분</h3>
            <div className="space-y-4">
              {(() => {
                // 당첨 횟수 계산
                const winCounts = {};
                coffeeWinHistory.forEach(record => {
                  record.winners.forEach(winner => {
                    winCounts[winner] = (winCounts[winner] || 0) + 1;
                  });
                });
                
                // 상위 3명 추출
                return Object.entries(winCounts)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([name, count], index) => (
                    <div key={name} className={`flex items-center justify-between p-4 rounded-lg ${
                      index === 0 ? "bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200" :
                      index === 1 ? "bg-gradient-to-r from-gray-50 to-orange-50 border-2 border-gray-200" :
                      "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200"
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? "bg-orange-500" :
                          index === 1 ? "bg-gray-400" :
                          "bg-yellow-500"
                        }`}>
                          {index + 1}
                        </div>
                        <h4 className="font-bold text-gray-800">{name}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">{count}</div>
                        <div className="text-sm text-gray-500">회</div>
                      </div>
                    </div>
                  ));
              })()}
            </div>
          </div>
        )}
     
     {/* 제작자 정보 */}
     <div className="max-w-4xl mx-auto mt-8 text-center text-gray-500 text-sm">
       <div className="border-t pt-6">
         <p>마켓사업본부 박진유 제작</p>
         <a 
           href="https://github.com/yakchacha/lunchmenu" 
           target="_blank" 
           rel="noopener noreferrer"
           className="text-blue-500 hover:text-blue-700 transition-colors"
         >
           GitHub 바로가기
         </a>
       </div>
     </div>
   </div>
 );
}

export default LunchRoulette;
            
