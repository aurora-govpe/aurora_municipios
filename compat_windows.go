//go:build windows

package main

/*
#include <stdint.h>
#include <stddef.h>

struct __emutls_object {
    uintptr_t size;
    uintptr_t align;
    union {
        uintptr_t offset;
        void *ptr;
    } loc;
};

struct __emutls_object once_call_obj = { sizeof(void*), sizeof(void*), { 0 } };
struct __emutls_object once_callable_obj = { sizeof(void*), sizeof(void*), { 0 } };

__asm__(".globl __emutls_v._ZSt11__once_call\n"
        "__emutls_v._ZSt11__once_call = once_call_obj\n");

__asm__(".globl __emutls_v._ZSt15__once_callable\n"
        "__emutls_v._ZSt15__once_callable = once_callable_obj\n");
*/
import "C"
