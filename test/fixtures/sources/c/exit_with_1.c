#if defined __linux__ || defined __APPLE__
  #include <stdlib.h>
#elif defined _WIN32 || defined _WIN32
  // #include <windows.h>
#endif

int main(int argc, char const *argv[]) {
  return 1;
}
