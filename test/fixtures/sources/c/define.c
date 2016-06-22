
int main()
{
    #ifdef FLAG_IS_SET
       return 12;
    #else
       return 13;
    #endif
}
