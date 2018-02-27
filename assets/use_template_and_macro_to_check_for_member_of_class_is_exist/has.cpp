#include <functional>
#include <type_traits>

#include <iostream>
#include <vector>
#include <cassert>

#define HAS_MEMBER_DEF(name)                                                   \
  namespace detail {                                                           \
  template <class T, class F = void> class HasMember_##name {                  \
    template <class _Ux>                                                       \
    static std::true_type                                                      \
    Check(int,                                                                 \
          typename std::enable_if<std::is_void<F>::value,                      \
                                  decltype(&_Ux::name) *>::type = nullptr);    \
    template <class _Ux>                                                       \
    static std::true_type                                                      \
    Check(int, decltype(std::mem_fn<F>(&_Ux::name)) * = nullptr);              \
    template <class _Ux>                                                       \
    static std::true_type Check(int, typename _Ux::name * = nullptr);          \
    template <class _Ux> static std::false_type Check(...);                    \
                                                                               \
  public:                                                                      \
    static constexpr bool value = decltype(Check<T>(0))::value;                \
  };                                                                           \
  }
#define HAS_MEMBER(type, name, ...)                                            \
  detail::HasMember_##name<type, ##__VA_ARGS__>::value

#define HAS_DEF(name)                                                          \
  namespace detail {                                                           \
  template <class F = void> class Has_##name {                                 \
    template <class _Ux>                                                       \
    static std::true_type                                                      \
    Check(int, typename std::enable_if<std::is_void<F>::value,                 \
                                       decltype(&name) *>::type = nullptr);    \
    template <class _Ux>                                                       \
    static std::true_type                                                      \
    Check(int, decltype(std::bind<void, typename std::decay<F>::type>(         \
                   &name)) * = nullptr);                                       \
    template <class _Ux> static std::false_type Check(...);                    \
                                                                               \
  public:                                                                      \
    static constexpr bool value = decltype(Check<void>(0))::value;             \
  };                                                                           \
  }
#define HAS(name, ...) detail::Has_##name<##__VA_ARGS__>::value

HAS_MEMBER_DEF(push_back);
HAS_MEMBER_DEF(size);
HAS_MEMBER_DEF(value_type);
HAS_MEMBER_DEF(first);
HAS_MEMBER_DEF(x);

#if defined(_MSC_VER) && (_MSC_VER >= 1900)
void Print() {}
void Print(int) {}
void X() {}
int aaa;

HAS_DEF(Print)
HAS_DEF(Print1)
HAS_DEF(X)
HAS_DEF(aaa)
HAS_DEF(bbb)
#endif

template <bool C, class Ft, class Ff, class... Args>
typename std::enable_if<C, size_t>::type Exec(Ft &&ft, Ff &&ff, Args &&... args) {
  return std::forward<Ft>(ft)(std::forward<Args>(args)...);
}
template <bool C, class Ft, class Ff, class... Args>
typename std::enable_if<!C, size_t>::type Exec(Ft &&ft, Ff &&ff, Args &&... args) {
  return std::forward<Ff>(ff)(std::forward<Args>(args)...);
}
template <class T> auto Size(const T &obj) {
  return Exec<HAS_MEMBER(T, size)>(
    [](const auto &obj) { return obj.size(); },
    [](const auto &obj) { return -1; }, obj);
}

int main() {
  static_assert(HAS_MEMBER(std::vector<int>, push_back) == false, "重载函数");
  static_assert(HAS_MEMBER(std::vector<int>, push_back, void(const int &)), "重载函数指定函数类型");
  static_assert(HAS_MEMBER(std::vector<int>, size), "非重载函数");
  static_assert(HAS_MEMBER(std::vector<int>, size, size_t()) == false, "非重载函数带错误函数类型");
  static_assert(HAS_MEMBER(std::vector<int>, size, size_t() const), "非重载函数带正确函数类型");
  static_assert(HAS_MEMBER(std::vector<int>, value_type), "类型定义");

  using IntIntPairType = std::pair<int, int>; // 解决宏分不清,的问题
  static_assert(HAS_MEMBER(IntIntPairType, first), "成员函数");
  static_assert(HAS_MEMBER(IntIntPairType, x) == false, "不存在");

  std::vector<int> a;
  IntIntPairType b;

  assert(Size(a) == 0);
  assert(Size(b) == -1);

#if defined(_MSC_VER) && (_MSC_VER >= 1900)
  static_assert(HAS(Print) == false, "重载函数");
  static_assert(HAS(Print, void(int)), "重载函数指定函数类型");
  static_assert(HAS(X), "非重载函数");
  static_assert(HAS(X, void(int)) == false, "非重载函数带错误函数类型");
  static_assert(HAS(X, void()), "非重载函数带正确函数类型");
  static_assert(HAS(aaa), "变量");
  static_assert(HAS(bbb) == false, "不存在");
#endif
}