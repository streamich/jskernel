cmake_minimum_required(VERSION 3.5)
project(v8)

include_directories(${MY_SOURCE_DIR}/include)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")

set(SOURCE_FILES
    full-v8.cpp full-v8.h)

add_executable(v8 ${SOURCE_FILES})