(module
 (type $0 (func (param i32 i32) (result i32)))
 (type $1 (func (param i32) (result i32)))
 (type $2 (func (param i32 i32)))
 (type $3 (func (param i32 i32 i32)))
 (type $4 (func (result i32)))
 (type $5 (func (param i32)))
 (type $6 (func (param i32 i32 i32) (result i32)))
 (type $7 (func (param i32 i32 i32 i32) (result i32)))
 (type $8 (func))
 (type $9 (func (param i32 i32 i32 i32)))
 (type $10 (func (param i32 i32 i64)))
 (type $11 (func (param i64 i64) (result i32)))
 (type $12 (func (param i64 i64 i64 i64) (result i32)))
 (type $13 (func (param i64 i64)))
 (type $14 (func (param i64) (result i64)))
 (type $15 (func (param i32) (result i64)))
 (type $16 (func (param i32 i32) (result i64)))
 (type $17 (func (param i64 i64 i64 i64 i64 i64 i64 i64) (result i32)))
 (type $18 (func (param i32 i64)))
 (import "env" "exit" (func $~lib/@btc-vision/btc-runtime/runtime/env/global/env_exit (param i32 i32 i32)))
 (import "env" "environment" (func $~lib/@btc-vision/btc-runtime/runtime/env/global/getEnvironmentVariables (param i32 i32 i32)))
 (import "env" "calldata" (func $~lib/@btc-vision/btc-runtime/runtime/env/global/getCalldata (param i32 i32 i32)))
 (import "env" "sha256" (func $~lib/@btc-vision/btc-runtime/runtime/env/global/_sha256 (param i32 i32 i32)))
 (import "env" "load" (func $~lib/@btc-vision/btc-runtime/runtime/env/global/loadPointer (param i32 i32)))
 (import "env" "store" (func $~lib/@btc-vision/btc-runtime/runtime/env/global/storePointer (param i32 i32)))
 (import "env" "call" (func $~lib/@btc-vision/btc-runtime/runtime/env/global/callContract (param i32 i32 i32 i32) (result i32)))
 (import "env" "callResult" (func $~lib/@btc-vision/btc-runtime/runtime/env/global/getCallResult (param i32 i32 i32)))
 (global $~lib/rt/stub/offset (mut i32) (i32.const 0))
 (global $~lib/@btc-vision/btc-runtime/runtime/script/Networks/Network (mut i32) (i32.const 0))
 (global $~lib/@btc-vision/btc-runtime/runtime/math/bytes/EMPTY_BUFFER (mut i32) (i32.const 0))
 (global $~lib/@btc-vision/btc-runtime/runtime/math/bytes/EMPTY_POINTER (mut i32) (i32.const 0))
 (global $~lib/@btc-vision/btc-runtime/runtime/math/bytes/ONE_BUFFER (mut i32) (i32.const 0))
 (global $~lib/@btc-vision/btc-runtime/runtime/types/ExtendedAddressCache/_cachedDeadAddress (mut i32) (i32.const 0))
 (global $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/SCRATCH_BUF (mut i32) (i32.const 0))
 (global $~argumentsLength (mut i32) (i32.const 0))
 (global $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/FOUR_BYTES_UINT8ARRAY_MEMORY_CACHE (mut i32) (i32.const 0))
 (global $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain (mut i32) (i32.const 0))
 (global $~lib/@btc-vision/btc-runtime/runtime/contracts/ReentrancyGuard/statusPointer (mut i32) (i32.const 0))
 (global $~lib/@btc-vision/btc-runtime/runtime/contracts/ReentrancyGuard/depthPointer (mut i32) (i32.const 0))
 (global $src/BlockBillContract/FEE_BPS (mut i32) (i32.const 0))
 (global $src/BlockBillContract/BPS_DENOMINATOR (mut i32) (i32.const 0))
 (global $~lib/@btc-vision/as-bignum/assembly/globals/__u256carry (mut i64) (i64.const 0))
 (global $~lib/@btc-vision/as-bignum/assembly/globals/__res128_hi (mut i64) (i64.const 0))
 (global $~lib/@btc-vision/as-bignum/assembly/globals/__u256carrySub (mut i64) (i64.const 0))
 (global $~started (mut i32) (i32.const 0))
 (memory $0 1)
 (data $0 (i32.const 1036) "\1c\02")
 (data $0.1 (i32.const 1048) "\05\00\00\00\00\02\00\00000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff")
 (data $1 (i32.const 1580) "\1c")
 (data $1.1 (i32.const 1592) "\01")
 (data $2 (i32.const 1612) "\9c")
 (data $2.1 (i32.const 1624) "\01\00\00\00\80")
 (data $2.2 (i32.const 1652) "\19\00\00\00\d6\00\00\00h\00\00\00\9c\00\00\00\08\00\00\00Z\00\00\00\e1\00\00\00e\00\00\00\83\00\00\00\1e\00\00\00\93\00\00\00O\00\00\00\f7\00\00\00c\00\00\00\ae\00\00\00F\00\00\00\a2\00\00\00\a6\00\00\00\c1\00\00\00r\00\00\00\b3\00\00\00\f1\00\00\00\b6\00\00\00\n\00\00\00\8c\00\00\00\e2\00\00\00o")
 (data $3 (i32.const 1772) "\9c")
 (data $3.1 (i32.const 1784) "\01\00\00\00\80")
 (data $3.2 (i32.const 1808) "\t\00\00\003\00\00\00\ea\00\00\00\01\00\00\00\ad\00\00\00\0e\00\00\00\e9\00\00\00\84\00\00\00 \00\00\00\97\00\00\00y\00\00\00\ba\00\00\00\ae\00\00\00\c3\00\00\00\ce\00\00\00\d9\00\00\00\0f\00\00\00\a3\00\00\00\f4\00\00\00\08\00\00\00q\00\00\00\95\00\00\00&\00\00\00\f8\00\00\00\d7\00\00\00\7f\00\00\00I\00\00\00C")
 (data $4 (i32.const 1932) "\9c")
 (data $4.1 (i32.const 1944) "\01\00\00\00\80\00\00\00\0f\00\00\00\91\00\00\00\88\00\00\00\f1\00\00\00<\00\00\00\b7\00\00\00\b2\00\00\00\c7\00\00\00\1f\00\00\00*\00\00\003\00\00\00^\00\00\00:\00\00\00O\00\00\00\c3\00\00\00(\00\00\00\bf\00\00\00[\00\00\00\eb\00\00\00C\00\00\00`\00\00\00\12\00\00\00\af\00\00\00\ca\00\00\00Y\00\00\00\0b\00\00\00\1a\00\00\00\11\00\00\00F\00\00\00n\00\00\00\"\00\00\00\06")
 (data $5 (i32.const 2092) "\9c")
 (data $5.1 (i32.const 2104) "\01\00\00\00\80")
 (data $5.2 (i32.const 2120) "\01\00\00\00\7f\00\00\00\85\00\00\00\10\00\00\00k\00\00\00\1f\00\00\00\ee\00\00\00\af\00\00\00/\00\00\00p\00\00\00\f1\00\00\00\e2\00\00\00\b8\00\00\00\05\00\00\00\98\00\00\00[\00\00\00\b5\00\00\00u\00\00\00\f8\00\00\00\8f\00\00\00\9b\00\00\00\0b\00\00\00\a5\00\00\00u\00\00\00=\00\00\00/\00\00\00<\00\00\00\f1\00\00\002\00\00\00s")
 (data $6 (i32.const 2252) "<")
 (data $6.1 (i32.const 2264) "\02\00\00\00$\00\00\00A\00r\00r\00a\00y\00 \00i\00s\00 \00t\00o\00o\00 \00l\00a\00r\00g\00e")
 (data $7 (i32.const 2316) "\\")
 (data $7.1 (i32.const 2328) "\02\00\00\00@\00\00\00q\00p\00z\00r\00y\009\00x\008\00g\00f\002\00t\00v\00d\00w\000\00s\003\00j\00n\005\004\00k\00h\00c\00e\006\00m\00u\00a\007\00l")
 (data $8 (i32.const 2412) "<")
 (data $8.1 (i32.const 2424) "\01\00\00\00 \00\00\00(J\e4\ac\db2\a9\9b\a3\eb\faf\a9\1d\dbA\a7\b7\a1\d2\fe\f4\159\99\"\cd\8a\04H\\\02")
 (data $9 (i32.const 2476) ",")
 (data $9.1 (i32.const 2488) "\08\00\00\00\10\00\00\00\80\t\00\00\80\t\00\00 \00\00\00 ")
 (data $10 (i32.const 2524) "<")
 (data $10.1 (i32.const 2536) "\01\00\00\00 ")
 (data $11 (i32.const 2588) ",")
 (data $11.1 (i32.const 2600) "\08\00\00\00\10\00\00\00\f0\t\00\00\f0\t\00\00 \00\00\00 ")
 (data $12 (i32.const 2636) "\1c")
 (data $12.1 (i32.const 2648) "\01")
 (data $13 (i32.const 2668) "\1c")
 (data $13.1 (i32.const 2680) "\01")
 (data $14 (i32.const 2700) "<")
 (data $14.1 (i32.const 2712) "\01\00\00\00 \00\00\00~\88\02\f1\fd#\e1\0e\r\de?\00\c0\aaH\15\d8\85\ec\d9\cd\a0\dfV\ff\a2^\ccp-E\8e")
 (data $15 (i32.const 2764) ",")
 (data $15.1 (i32.const 2776) "\08\00\00\00\10\00\00\00\a0\n\00\00\a0\n\00\00 \00\00\00 ")
 (data $16 (i32.const 2812) "<")
 (data $16.1 (i32.const 2824) "\01\00\00\00 \00\00\00p\87\994\92\1c/H\17x\87\89w\d5\b4^*Y\da\1d(\"A\c9?\f1\baj\f0\98\fc\d0")
 (data $17 (i32.const 2876) ",")
 (data $17.1 (i32.const 2888) "\08\00\00\00\10\00\00\00\10\0b\00\00\10\0b\00\00 \00\00\00 ")
 (data $18 (i32.const 2924) "<")
 (data $18.1 (i32.const 2936) "\01\00\00\00 \00\00\00Zd,\a2\d8\fd\e9\e1(\87|\f5]q\96\e3:\d4K\b3K\n\8d\85\8d\a8\04\bd;\86!\0e")
 (data $19 (i32.const 2988) ",")
 (data $19.1 (i32.const 3000) "\08\00\00\00\10\00\00\00\80\0b\00\00\80\0b\00\00 \00\00\00 ")
 (data $20 (i32.const 3036) "<")
 (data $20.1 (i32.const 3048) "\01\00\00\00 \00\00\00{\f8\b69_\ea\cc\15\97\128\00\91\b9+\96gk+sF\ff)\'\bf\1aT\f8\fc\ef\9c\0b")
 (data $21 (i32.const 3100) ",")
 (data $21.1 (i32.const 3112) "\08\00\00\00\10\00\00\00\f0\0b\00\00\f0\0b\00\00 \00\00\00 ")
 (data $22 (i32.const 3148) "<")
 (data $22.1 (i32.const 3160) "\01\00\00\00 \00\00\00\fe\e8\"\925\1d\1a\8b\ab!\c4\ef\dd\15~1h\e8\f62:\d0L\ba\12\f7|\0b\dcF\"X")
 (data $23 (i32.const 3212) ",")
 (data $23.1 (i32.const 3224) "\08\00\00\00\10\00\00\00`\0c\00\00`\0c\00\00 \00\00\00 ")
 (data $24 (i32.const 3260) "<")
 (data $24.1 (i32.const 3272) "\01\00\00\00 \00\00\00k\86\b2s\ff4\fc\e1\9dk\80N\ffZ?WG\ad\a4\ea\a2/\1dI\c0\1eR\dd\b7\87[K")
 (data $25 (i32.const 3324) ",")
 (data $25.1 (i32.const 3336) "\08\00\00\00\10\00\00\00\d0\0c\00\00\d0\0c\00\00 \00\00\00 ")
 (data $26 (i32.const 3372) "<")
 (data $26.1 (i32.const 3384) "\01\00\00\00 \00\00\00\b8n\99\da\c0GKJ\9f\c32:\d6\ed/9U\e7\b8m\c6\8cbB\82\1c\bc\ac\a2\d8y\de")
 (data $27 (i32.const 3436) ",")
 (data $27.1 (i32.const 3448) "\08\00\00\00\10\00\00\00@\r\00\00@\r\00\00 \00\00\00 ")
 (data $28 (i32.const 3484) "<")
 (data $28.1 (i32.const 3496) "\01\00\00\00 \00\00\00OH\06]\9e\f1E%k\f7\7f\d2\e5\8by\e6\f6\0c\d0\d3Gp\1424P\c9e\b7K\80\ed")
 (data $29 (i32.const 3548) ",")
 (data $29.1 (i32.const 3560) "\08\00\00\00\10\00\00\00\b0\r\00\00\b0\r\00\00 \00\00\00 ")
 (data $30 (i32.const 3596) "<")
 (data $30.1 (i32.const 3608) "\01\00\00\00 \00\00\00\f9\03\d7\be\0c\a4\99\eem}F\"\c7\92\b2\ead\ab\a6\afhQ\03\fe\c4\ae\12\d7\a6\a9\b2\0f")
 (data $31 (i32.const 3660) ",")
 (data $31.1 (i32.const 3672) "\08\00\00\00\10\00\00\00 \0e\00\00 \0e\00\00 \00\00\00 ")
 (data $32 (i32.const 3708) "<")
 (data $32.1 (i32.const 3720) "\01\00\00\00 \00\00\00/\fc\ff\ff\fe\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff")
 (data $33 (i32.const 3772) ",")
 (data $33.1 (i32.const 3784) "\08\00\00\00\10\00\00\00\90\0e\00\00\90\0e\00\00 \00\00\00 ")
 (data $34 (i32.const 3820) "<")
 (data $34.1 (i32.const 3832) "\01\00\00\00 \00\00\00\98\17\f8\16\b1[(\d9Y(\ce-\db\fc\9b\02p\b0\87\ce\95\a0bU\ac\bb\dc\f9\eff\bey")
 (data $35 (i32.const 3884) ",")
 (data $35.1 (i32.const 3896) "\08\00\00\00\10\00\00\00\00\0f\00\00\00\0f\00\00 \00\00\00 ")
 (data $36 (i32.const 3932) "<")
 (data $36.1 (i32.const 3944) "\01\00\00\00 \00\00\00\b8\d4\10\fb\8f\d0G\9c\19T\85\a6H\b4\17\fd\a8\08\11\0e\fc\fb\a4]e\c4\a3&w\da:H")
 (data $37 (i32.const 3996) ",")
 (data $37.1 (i32.const 4008) "\08\00\00\00\10\00\00\00p\0f\00\00p\0f\00\00 \00\00\00 ")
 (data $38 (i32.const 4044) "L")
 (data $38.1 (i32.const 4056) "\02\00\00\002\00\00\00t\00r\00a\00n\00s\00f\00e\00r\00(\00a\00d\00d\00r\00e\00s\00s\00,\00u\00i\00n\00t\002\005\006\00)")
 (data $39 (i32.const 4124) "\\")
 (data $39.1 (i32.const 4136) "\02\00\00\00J\00\00\00t\00r\00a\00n\00s\00f\00e\00r\00F\00r\00o\00m\00(\00a\00d\00d\00r\00e\00s\00s\00,\00a\00d\00d\00r\00e\00s\00s\00,\00u\00i\00n\00t\002\005\006\00)")
 (data $40 (i32.const 4220) "\\")
 (data $40.1 (i32.const 4232) "\02\00\00\00F\00\00\00s\00a\00f\00e\00T\00r\00a\00n\00s\00f\00e\00r\00(\00a\00d\00d\00r\00e\00s\00s\00,\00u\00i\00n\00t\002\005\006\00,\00b\00y\00t\00e\00s\00)")
 (data $41 (i32.const 4316) "|")
 (data $41.1 (i32.const 4328) "\02\00\00\00^\00\00\00s\00a\00f\00e\00T\00r\00a\00n\00s\00f\00e\00r\00F\00r\00o\00m\00(\00a\00d\00d\00r\00e\00s\00s\00,\00a\00d\00d\00r\00e\00s\00s\00,\00u\00i\00n\00t\002\005\006\00,\00b\00y\00t\00e\00s\00)")
 (data $42 (i32.const 4444) "\\")
 (data $42.1 (i32.const 4456) "\02\00\00\00D\00\00\00i\00n\00c\00r\00e\00a\00s\00e\00A\00l\00l\00o\00w\00a\00n\00c\00e\00(\00a\00d\00d\00r\00e\00s\00s\00,\00u\00i\00n\00t\002\005\006\00)")
 (data $43 (i32.const 4540) "\\")
 (data $43.1 (i32.const 4552) "\02\00\00\00D\00\00\00d\00e\00c\00r\00e\00a\00s\00e\00A\00l\00l\00o\00w\00a\00n\00c\00e\00(\00a\00d\00d\00r\00e\00s\00s\00,\00u\00i\00n\00t\002\005\006\00)")
 (data $44 (i32.const 4636) ",")
 (data $44.1 (i32.const 4648) "\02\00\00\00\1a\00\00\00b\00u\00r\00n\00(\00u\00i\00n\00t\002\005\006\00)")
 (data $45 (i32.const 4684) "|")
 (data $45.1 (i32.const 4696) "\01\00\00\00`")
 (data $45.2 (i32.const 4715) "\80\00\00\00\80")
 (data $45.3 (i32.const 4731) "\80\00\00\00\80")
 (data $45.4 (i32.const 4759) "\80\00\00\00\80\00\00\00\80\00\00\00\80\00\00\00\80\00\00\00\00\00\00\00\80\00\00\00\80\00\00\00\80\00\00\00\00\00\00\00\80")
 (data $46 (i32.const 4812) ",")
 (data $46.1 (i32.const 4824) " \00\00\00\10\00\00\00`\12\00\00`\12\00\00`\00\00\00\18")
 (data $47 (i32.const 4860) "|")
 (data $47.1 (i32.const 4872) "\01\00\00\00`\00\00\00\01\00\00\00\82\80\00\00\8a\80\00\00\00\80\00\80\8b\80\00\00\01\00\00\80\81\80\00\80\t\80\00\00\8a\00\00\00\88\00\00\00\t\80\00\80\n\00\00\80\8b\80\00\80\8b\00\00\00\89\80\00\00\03\80\00\00\02\80\00\00\80\00\00\00\n\80\00\00\n\00\00\80\81\80\00\80\80\80\00\00\01\00\00\80\08\80\00\80")
 (data $48 (i32.const 4988) ",")
 (data $48.1 (i32.const 5000) " \00\00\00\10\00\00\00\10\13\00\00\10\13\00\00`\00\00\00\18")
 (data $49 (i32.const 5036) "|")
 (data $49.1 (i32.const 5048) "\01\00\00\00`\00\00\00\01\00\00\00\03\00\00\00\06\00\00\00\n\00\00\00\0f\00\00\00\15\00\00\00\1c\00\00\00$\00\00\00-\00\00\007\00\00\00\02\00\00\00\0e\00\00\00\1b\00\00\00)\00\00\008\00\00\00\08\00\00\00\19\00\00\00+\00\00\00>\00\00\00\12\00\00\00\'\00\00\00=\00\00\00\14\00\00\00,")
 (data $50 (i32.const 5164) ",")
 (data $50.1 (i32.const 5176) "\t\00\00\00\10\00\00\00\c0\13\00\00\c0\13\00\00`\00\00\00\18")
 (data $51 (i32.const 5212) "|")
 (data $51.1 (i32.const 5224) "\01\00\00\00`\00\00\00\n\00\00\00\07\00\00\00\0b\00\00\00\11\00\00\00\12\00\00\00\03\00\00\00\05\00\00\00\10\00\00\00\08\00\00\00\15\00\00\00\18\00\00\00\04\00\00\00\0f\00\00\00\17\00\00\00\13\00\00\00\r\00\00\00\0c\00\00\00\02\00\00\00\14\00\00\00\0e\00\00\00\16\00\00\00\t\00\00\00\06\00\00\00\01")
 (data $52 (i32.const 5340) ",")
 (data $52.1 (i32.const 5352) "\t\00\00\00\10\00\00\00p\14\00\00p\14\00\00`\00\00\00\18")
 (data $53 (i32.const 5388) "\1c")
 (data $53.1 (i32.const 5400) "\01")
 (data $54 (i32.const 5420) ",")
 (data $54.1 (i32.const 5432) "\02\00\00\00\1a\00\00\00S\00t\00o\00r\00e\00d\00B\00o\00o\00l\00e\00a\00n")
 (data $55 (i32.const 5468) ",")
 (data $55.1 (i32.const 5480) "\02\00\00\00\14\00\00\00S\00t\00o\00r\00e\00d\00U\002\005\006")
 (data $56 (i32.const 5516) "\1c")
 (data $56.1 (i32.const 5528) "%\00\00\00\08\00\00\00\01")
 (data $57 (i32.const 5548) "\1c")
 (data $57.1 (i32.const 5560) "\02\00\00\00\08\00\00\00 \00a\00t\00 ")
 (data $58 (i32.const 5580) "\1c")
 (data $58.1 (i32.const 5592) "\02\00\00\00\02\00\00\00:")
 (data $59 (i32.const 5612) ",\00\00\00\03\00\00\00\00\00\00\00&\00\00\00\1c\00\00\00\00\00\00\00\c0\15\00\00\00\00\00\00\e0\15\00\00\00\00\00\00\e0\15")
 (data $60 (i32.const 5660) "\1c")
 (data $60.1 (i32.const 5672) "\02\00\00\00\02\00\00\000")
 (data $61 (i32.const 5692) "\\")
 (data $61.1 (i32.const 5704) "\02\00\00\00H\00\00\000\001\002\003\004\005\006\007\008\009\00a\00b\00c\00d\00e\00f\00g\00h\00i\00j\00k\00l\00m\00n\00o\00p\00q\00r\00s\00t\00u\00v\00w\00x\00y\00z")
 (data $62 (i32.const 5788) "\1c")
 (data $62.1 (i32.const 5800) "\02")
 (data $63 (i32.const 5820) "\1c")
 (data $63.1 (i32.const 5832) "\01")
 (data $64 (i32.const 5852) "|")
 (data $64.1 (i32.const 5864) "\02\00\00\00^\00\00\00U\00n\00e\00x\00p\00e\00c\00t\00e\00d\00 \00\'\00n\00u\00l\00l\00\'\00 \00(\00n\00o\00t\00 \00a\00s\00s\00i\00g\00n\00e\00d\00 \00o\00r\00 \00f\00a\00i\00l\00e\00d\00 \00c\00a\00s\00t\00)")
 (data $65 (i32.const 5980) ",")
 (data $65.1 (i32.const 5992) "\02\00\00\00\14\00\00\00d\00e\00p\00l\00o\00y\00e\00r\00(\00)")
 (data $66 (i32.const 6028) "\1c")
 (data $66.1 (i32.const 6040) "\01")
 (table $0 2 2 funcref)
 (elem $0 (i32.const 1) $start:src/index~anonymous|0)
 (export "abort" (func $src/index/abort))
 (export "execute" (func $~lib/@btc-vision/btc-runtime/runtime/exports/index/execute))
 (export "onDeploy" (func $~lib/@btc-vision/btc-runtime/runtime/exports/index/onDeploy))
 (export "onUpdate" (func $~lib/@btc-vision/btc-runtime/runtime/exports/index/onUpdate))
 (export "memory" (memory $0))
 (export "start" (func $~start))
 (func $~lib/rt/stub/maybeGrowMemory (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  memory.size
  local.tee $1
  i32.const 16
  i32.shl
  i32.const 15
  i32.add
  i32.const -16
  i32.and
  local.tee $2
  local.get $0
  i32.lt_u
  if
   local.get $1
   local.get $0
   local.get $2
   i32.sub
   i32.const 65535
   i32.add
   i32.const -65536
   i32.and
   i32.const 16
   i32.shr_u
   local.tee $2
   local.get $1
   local.get $2
   i32.gt_s
   select
   memory.grow
   i32.const 0
   i32.lt_s
   if
    local.get $2
    memory.grow
    i32.const 0
    i32.lt_s
    if
     unreachable
    end
   end
  end
  local.get $0
  global.set $~lib/rt/stub/offset
 )
 (func $~lib/rt/stub/__alloc (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  i32.const 1073741820
  i32.gt_u
  if
   unreachable
  end
  global.get $~lib/rt/stub/offset
  global.get $~lib/rt/stub/offset
  i32.const 4
  i32.add
  local.tee $2
  local.get $0
  i32.const 19
  i32.add
  i32.const -16
  i32.and
  i32.const 4
  i32.sub
  local.tee $0
  i32.add
  call $~lib/rt/stub/maybeGrowMemory
  local.get $0
  i32.store
  local.get $2
 )
 (func $~lib/rt/stub/__new (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  i32.const 1073741804
  i32.gt_u
  if
   unreachable
  end
  local.get $0
  i32.const 16
  i32.add
  call $~lib/rt/stub/__alloc
  local.tee $3
  i32.const 4
  i32.sub
  local.tee $2
  i32.const 0
  i32.store offset=4
  local.get $2
  i32.const 0
  i32.store offset=8
  local.get $2
  local.get $1
  i32.store offset=12
  local.get $2
  local.get $0
  i32.store offset=16
  local.get $3
  i32.const 16
  i32.add
 )
 (func $~lib/@btc-vision/as-bignum/assembly/integer/u128/u128#constructor (param $0 i64) (param $1 i64) (result i32)
  (local $2 i32)
  i32.const 16
  i32.const 4
  call $~lib/rt/stub/__new
  local.tee $2
  local.get $0
  i64.store
  local.get $2
  local.get $1
  i64.store offset=8
  local.get $2
 )
 (func $~lib/typedarray/Uint8Array#constructor (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  local.get $0
  i32.eqz
  if
   i32.const 12
   i32.const 7
   call $~lib/rt/stub/__new
   local.set $0
  end
  local.get $0
  i32.eqz
  if
   i32.const 12
   i32.const 3
   call $~lib/rt/stub/__new
   local.set $0
  end
  local.get $0
  i32.const 0
  i32.store
  local.get $0
  i32.const 0
  i32.store offset=4
  local.get $0
  i32.const 0
  i32.store offset=8
  local.get $1
  i32.const 1073741820
  i32.gt_u
  if
   unreachable
  end
  local.get $1
  i32.const 1
  call $~lib/rt/stub/__new
  local.tee $2
  i32.const 0
  local.get $1
  memory.fill
  local.get $0
  local.get $2
  i32.store
  local.get $0
  local.get $2
  i32.store offset=4
  local.get $0
  local.get $1
  i32.store offset=8
  local.get $0
 )
 (func $~lib/typedarray/Uint8Array#set<~lib/array/Array<u8>> (param $0 i32) (param $1 i32)
  (local $2 i32)
  local.get $1
  i32.load offset=12
  local.tee $2
  local.get $0
  i32.load offset=8
  i32.gt_s
  if
   unreachable
  end
  local.get $0
  i32.load offset=4
  local.get $1
  i32.load offset=4
  local.get $2
  memory.copy
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#constructor (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  i32.eqz
  if
   i32.const 20
   i32.const 6
   call $~lib/rt/stub/__new
   local.set $0
  end
  local.get $0
  i32.const 0
  i32.store8 offset=12
  local.get $0
  i32.const 0
  i32.store offset=16
  local.get $0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
  local.set $0
  local.get $1
  if (result i32)
   local.get $1
   i32.load offset=12
  else
   i32.const 0
  end
  if
   local.get $1
   i32.load offset=12
   i32.const 32
   i32.ne
   if
    unreachable
   end
   local.get $0
   local.get $1
   call $~lib/typedarray/Uint8Array#set<~lib/array/Array<u8>>
   local.get $0
   i32.const 1
   i32.store8 offset=12
  end
  local.get $0
 )
 (func $~lib/rt/__newArray (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (local $4 i32)
  local.get $0
  local.get $1
  i32.shl
  local.tee $4
  i32.const 1
  call $~lib/rt/stub/__new
  local.set $1
  local.get $3
  if
   local.get $1
   local.get $3
   local.get $4
   memory.copy
  end
  i32.const 16
  local.get $2
  call $~lib/rt/stub/__new
  local.tee $2
  local.get $1
  i32.store
  local.get $2
  local.get $1
  i32.store offset=4
  local.get $2
  local.get $4
  i32.store offset=8
  local.get $2
  local.get $0
  i32.store offset=12
  local.get $2
 )
 (func $~lib/typedarray/Uint8Array#set<~lib/array/Array<i32>> (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $1
  i32.load offset=12
  local.tee $3
  local.get $0
  i32.load offset=8
  i32.gt_s
  if
   unreachable
  end
  local.get $0
  i32.load offset=4
  local.set $0
  local.get $1
  i32.load offset=4
  local.set $1
  loop $for-loop|0
   local.get $2
   local.get $3
   i32.lt_s
   if
    local.get $0
    local.get $2
    i32.add
    local.get $1
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.store8
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
 )
 (func $~lib/typedarray/Uint8Array#__set (param $0 i32) (param $1 i32) (param $2 i32)
  local.get $1
  local.get $0
  i32.load offset=8
  i32.ge_u
  if
   unreachable
  end
  local.get $0
  i32.load offset=4
  local.get $1
  i32.add
  local.get $2
  i32.store8
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/types/ExtendedAddress/ExtendedAddress#constructor (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  i32.const 24
  i32.const 13
  call $~lib/rt/stub/__new
  local.tee $2
  i32.const 0
  i32.store offset=20
  local.get $2
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#constructor
  local.set $1
  local.get $0
  i32.load offset=12
  i32.const 32
  i32.ne
  if
   unreachable
  end
  local.get $1
  i32.const 0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
  i32.store offset=20
  local.get $1
  i32.load offset=20
  local.get $0
  call $~lib/typedarray/Uint8Array#set<~lib/array/Array<u8>>
  local.get $1
 )
 (func $~lib/arraybuffer/ArrayBuffer#constructor (param $0 i32) (result i32)
  (local $1 i32)
  local.get $0
  i32.const 1073741820
  i32.gt_u
  if
   unreachable
  end
  local.get $0
  i32.const 1
  call $~lib/rt/stub/__new
  local.tee $1
  i32.const 0
  local.get $0
  memory.fill
  local.get $1
 )
 (func $~lib/typedarray/Uint8Array.wrap@varargs (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  block $2of2
   block $1of2
    block $outOfRange
     global.get $~argumentsLength
     i32.const 1
     i32.sub
     br_table $1of2 $1of2 $2of2 $outOfRange
    end
    unreachable
   end
   i32.const -1
   local.set $2
  end
  local.get $0
  i32.const 20
  i32.sub
  i32.load offset=16
  local.set $1
  local.get $2
  i32.const 0
  i32.lt_s
  if
   local.get $2
   i32.const -1
   i32.eq
   if (result i32)
    local.get $1
   else
    unreachable
   end
   local.set $2
  else
   local.get $1
   local.get $2
   i32.lt_s
   if
    unreachable
   end
  end
  i32.const 12
  i32.const 7
  call $~lib/rt/stub/__new
  local.tee $1
  local.get $0
  i32.store
  local.get $1
  local.get $2
  i32.store offset=8
  local.get $1
  local.get $0
  i32.store offset=4
  local.get $1
 )
 (func $~lib/array/Array<u8>#constructor (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  i32.const 16
  i32.const 8
  call $~lib/rt/stub/__new
  local.tee $1
  i32.const 0
  i32.store
  local.get $1
  i32.const 0
  i32.store offset=4
  local.get $1
  i32.const 0
  i32.store offset=8
  local.get $1
  i32.const 0
  i32.store offset=12
  local.get $0
  i32.const 1073741820
  i32.gt_u
  if
   unreachable
  end
  i32.const 8
  local.get $0
  local.get $0
  i32.const 8
  i32.le_u
  select
  local.tee $2
  i32.const 1
  call $~lib/rt/stub/__new
  local.tee $3
  i32.const 0
  local.get $2
  memory.fill
  local.get $1
  local.get $3
  i32.store
  local.get $1
  local.get $3
  i32.store offset=4
  local.get $1
  local.get $2
  i32.store offset=8
  local.get $1
  local.get $0
  i32.store offset=12
  local.get $1
 )
 (func $~lib/typedarray/Uint8Array#__get (param $0 i32) (param $1 i32) (result i32)
  local.get $1
  local.get $0
  i32.load offset=8
  i32.ge_u
  if
   unreachable
  end
  local.get $0
  i32.load offset=4
  local.get $1
  i32.add
  i32.load8_u
 )
 (func $~lib/rt/stub/__renew (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $1
  i32.const 1073741804
  i32.gt_u
  if
   unreachable
  end
  local.get $0
  i32.const 16
  i32.sub
  local.tee $0
  i32.const 15
  i32.and
  i32.const 1
  local.get $0
  select
  if
   unreachable
  end
  global.get $~lib/rt/stub/offset
  local.get $0
  i32.const 4
  i32.sub
  local.tee $4
  i32.load
  local.tee $3
  local.get $0
  i32.add
  i32.eq
  local.set $6
  local.get $1
  i32.const 16
  i32.add
  local.tee $2
  i32.const 19
  i32.add
  i32.const -16
  i32.and
  i32.const 4
  i32.sub
  local.set $5
  local.get $2
  local.get $3
  i32.gt_u
  if
   local.get $6
   if
    local.get $2
    i32.const 1073741820
    i32.gt_u
    if
     unreachable
    end
    local.get $0
    local.get $5
    i32.add
    call $~lib/rt/stub/maybeGrowMemory
    local.get $4
    local.get $5
    i32.store
   else
    local.get $5
    local.get $3
    i32.const 1
    i32.shl
    local.tee $2
    local.get $2
    local.get $5
    i32.lt_u
    select
    call $~lib/rt/stub/__alloc
    local.tee $2
    local.get $0
    local.get $3
    memory.copy
    local.get $2
    local.set $0
   end
  else
   local.get $6
   if
    local.get $0
    local.get $5
    i32.add
    global.set $~lib/rt/stub/offset
    local.get $4
    local.get $5
    i32.store
   end
  end
  local.get $0
  i32.const 4
  i32.sub
  local.get $1
  i32.store offset=16
  local.get $0
  i32.const 16
  i32.add
 )
 (func $~lib/array/ensureCapacity (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $1
  local.get $0
  i32.load offset=8
  local.tee $3
  local.get $2
  i32.shr_u
  i32.gt_u
  if
   local.get $1
   i32.const 1073741820
   local.get $2
   i32.shr_u
   i32.gt_u
   if
    unreachable
   end
   local.get $0
   i32.load
   local.tee $4
   i32.const 1073741820
   local.get $3
   i32.const 1
   i32.shl
   local.tee $5
   local.get $5
   i32.const 1073741820
   i32.ge_u
   select
   local.tee $5
   i32.const 8
   local.get $1
   local.get $1
   i32.const 8
   i32.le_u
   select
   local.get $2
   i32.shl
   local.tee $1
   local.get $1
   local.get $5
   i32.lt_u
   select
   local.tee $1
   call $~lib/rt/stub/__renew
   local.tee $2
   local.get $3
   i32.add
   i32.const 0
   local.get $1
   local.get $3
   i32.sub
   memory.fill
   local.get $2
   local.get $4
   i32.ne
   if
    local.get $0
    local.get $2
    i32.store
    local.get $0
    local.get $2
    i32.store offset=4
   end
   local.get $0
   local.get $1
   i32.store offset=8
  end
 )
 (func $~lib/array/Array<u8>#__set (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  local.get $1
  local.get $0
  i32.load offset=12
  i32.ge_u
  if
   local.get $1
   i32.const 0
   i32.lt_s
   if
    unreachable
   end
   local.get $0
   local.get $1
   i32.const 1
   i32.add
   local.tee $3
   i32.const 0
   call $~lib/array/ensureCapacity
   local.get $0
   local.get $3
   i32.store offset=12
  end
  local.get $0
  i32.load offset=4
  local.get $1
  i32.add
  local.get $2
  i32.store8
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/types/ExtendedAddress/ExtendedAddress#clone (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $0
  i32.load offset=20
  i32.load offset=8
  call $~lib/array/Array<u8>#constructor
  local.set $3
  loop $for-loop|0
   local.get $1
   local.get $0
   i32.load offset=20
   i32.load offset=8
   i32.lt_s
   if
    local.get $3
    local.get $1
    local.get $0
    i32.load offset=20
    local.get $1
    call $~lib/typedarray/Uint8Array#__get
    call $~lib/array/Array<u8>#__set
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|0
   end
  end
  i32.const 1
  global.set $~argumentsLength
  local.get $0
  i32.load offset=8
  local.tee $1
  i32.const 0
  local.get $1
  i32.const 0
  i32.le_s
  select
  local.set $4
  i32.const 0
  local.get $1
  local.get $4
  i32.sub
  local.tee $1
  i32.const 0
  local.get $1
  i32.const 0
  i32.gt_s
  select
  local.tee $1
  call $~lib/typedarray/Uint8Array#constructor
  local.tee $2
  i32.load offset=4
  local.get $0
  i32.load offset=4
  local.get $4
  i32.add
  local.get $1
  memory.copy
  local.get $2
  i32.load offset=8
  call $~lib/array/Array<u8>#constructor
  local.set $4
  i32.const 0
  local.set $1
  loop $for-loop|1
   local.get $1
   local.get $2
   i32.load offset=8
   i32.lt_s
   if
    local.get $4
    local.get $1
    local.get $2
    local.get $1
    call $~lib/typedarray/Uint8Array#__get
    call $~lib/array/Array<u8>#__set
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|1
   end
  end
  local.get $3
  local.get $4
  call $~lib/@btc-vision/btc-runtime/runtime/types/ExtendedAddress/ExtendedAddress#constructor
  local.tee $1
  local.get $0
  i32.load8_u offset=12
  i32.store8 offset=12
  local.get $1
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/generic/MapUint8Array/MapUint8Array#constructor (result i32)
  (local $0 i32)
  i32.const 12
  i32.const 15
  call $~lib/rt/stub/__new
  local.tee $0
  i32.eqz
  if
   i32.const 0
   i32.const 0
   call $~lib/rt/stub/__new
   local.set $0
  end
  local.get $0
  i32.const 0
  i32.const 2
  i32.const 17
  i32.const 2656
  call $~lib/rt/__newArray
  i32.store
  local.get $0
  i32.const 0
  i32.const 2
  i32.const 17
  i32.const 2688
  call $~lib/rt/__newArray
  i32.store offset=4
  local.get $0
  i32.const -1
  i32.store offset=8
  local.get $0
 )
 (func $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor (param $0 i64) (param $1 i64) (param $2 i64) (param $3 i64) (result i32)
  (local $4 i32)
  i32.const 32
  i32.const 23
  call $~lib/rt/stub/__new
  local.tee $4
  local.get $0
  i64.store
  local.get $4
  local.get $1
  i64.store offset=8
  local.get $4
  local.get $2
  i64.store offset=16
  local.get $4
  local.get $3
  i64.store offset=24
  local.get $4
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer (param $0 i32) (result i32)
  local.get $0
  i32.load16_u offset=32
  i32.const 65535
  i32.eq
  if
   unreachable
  end
  local.get $0
  local.get $0
  i32.load16_u offset=32
  i32.const 1
  i32.add
  i32.store16 offset=32
  local.get $0
  i32.load16_u offset=32
 )
 (func $~lib/@btc-vision/as-bignum/assembly/integer/i128/i128#constructor (param $0 i64) (param $1 i64)
  (local $2 i32)
  i32.const 16
  i32.const 31
  call $~lib/rt/stub/__new
  local.tee $2
  local.get $0
  i64.store
  local.get $2
  local.get $1
  i64.store offset=8
 )
 (func $start:~lib/@btc-vision/btc-runtime/runtime/index
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  i32.const 6060
  global.set $~lib/rt/stub/offset
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u128/u128#constructor
  drop
  i64.const 1
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u128/u128#constructor
  drop
  i64.const -1
  i64.const -1
  call $~lib/@btc-vision/as-bignum/assembly/integer/u128/u128#constructor
  drop
  i32.const 0
  i32.const 0
  i32.const 0
  i32.const 8
  i32.const 1600
  call $~lib/rt/__newArray
  call $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#constructor
  drop
  i32.const 16
  i32.const 10
  call $~lib/rt/stub/__new
  local.tee $1
  i32.const 0
  i32.store
  local.get $1
  i32.const 0
  i32.store offset=4
  local.get $1
  i32.const 0
  i32.store offset=8
  local.get $1
  i32.const 0
  i32.store offset=12
  i32.const 0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
  local.tee $2
  i32.const 32
  i32.const 2
  i32.const 9
  i32.const 1632
  call $~lib/rt/__newArray
  call $~lib/typedarray/Uint8Array#set<~lib/array/Array<i32>>
  i32.const 0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
  local.tee $3
  i32.const 32
  i32.const 2
  i32.const 9
  i32.const 1792
  call $~lib/rt/__newArray
  call $~lib/typedarray/Uint8Array#set<~lib/array/Array<i32>>
  i32.const 0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
  local.tee $4
  i32.const 32
  i32.const 2
  i32.const 9
  i32.const 1952
  call $~lib/rt/__newArray
  call $~lib/typedarray/Uint8Array#set<~lib/array/Array<i32>>
  i32.const 0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
  local.tee $0
  i32.const 32
  i32.const 2
  i32.const 9
  i32.const 2112
  call $~lib/rt/__newArray
  call $~lib/typedarray/Uint8Array#set<~lib/array/Array<i32>>
  local.get $1
  local.get $2
  i32.store
  local.get $1
  local.get $3
  i32.store offset=4
  local.get $1
  local.get $0
  i32.store offset=8
  local.get $1
  local.get $4
  i32.store offset=12
  local.get $1
  global.set $~lib/@btc-vision/btc-runtime/runtime/script/Networks/Network
  i32.const 0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
  global.set $~lib/@btc-vision/btc-runtime/runtime/math/bytes/EMPTY_BUFFER
  i32.const 0
  i32.const 30
  call $~lib/typedarray/Uint8Array#constructor
  global.set $~lib/@btc-vision/btc-runtime/runtime/math/bytes/EMPTY_POINTER
  i32.const 0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
  global.set $~lib/@btc-vision/btc-runtime/runtime/math/bytes/ONE_BUFFER
  global.get $~lib/@btc-vision/btc-runtime/runtime/math/bytes/ONE_BUFFER
  i32.const 31
  i32.const 1
  call $~lib/typedarray/Uint8Array#__set
  i32.const 2608
  i32.const 2608
  call $~lib/@btc-vision/btc-runtime/runtime/types/ExtendedAddress/ExtendedAddress#constructor
  drop
  i32.const 2496
  i32.const 2608
  call $~lib/@btc-vision/btc-runtime/runtime/types/ExtendedAddress/ExtendedAddress#constructor
  drop
  i32.const 256
  call $~lib/arraybuffer/ArrayBuffer#constructor
  global.set $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/SCRATCH_BUF
  i32.const 1
  global.set $~argumentsLength
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/SCRATCH_BUF
  call $~lib/typedarray/Uint8Array.wrap@varargs
  drop
  i32.const 0
  i32.const 4
  call $~lib/typedarray/Uint8Array#constructor
  global.set $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/FOUR_BYTES_UINT8ARRAY_MEMORY_CACHE
  i32.const 52
  i32.const 14
  call $~lib/rt/stub/__new
  local.tee $0
  i32.eqz
  if
   i32.const 0
   i32.const 0
   call $~lib/rt/stub/__new
   local.set $0
  end
  global.get $~lib/@btc-vision/btc-runtime/runtime/types/ExtendedAddressCache/_cachedDeadAddress
  local.tee $1
  i32.eqz
  if
   i32.const 2496
   i32.const 2608
   call $~lib/@btc-vision/btc-runtime/runtime/types/ExtendedAddress/ExtendedAddress#constructor
   local.tee $1
   global.set $~lib/@btc-vision/btc-runtime/runtime/types/ExtendedAddressCache/_cachedDeadAddress
  end
  local.get $0
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/types/ExtendedAddress/ExtendedAddress#clone
  i32.store
  local.get $0
  call $~lib/@btc-vision/btc-runtime/runtime/generic/MapUint8Array/MapUint8Array#constructor
  i32.store offset=4
  local.get $0
  call $~lib/@btc-vision/btc-runtime/runtime/generic/MapUint8Array/MapUint8Array#constructor
  i32.store offset=8
  local.get $0
  i32.const 0
  i32.store offset=12
  local.get $0
  i32.const -1
  i32.store offset=16
  local.get $0
  i32.const 0
  i32.store offset=20
  local.get $0
  i32.const 0
  i32.store offset=24
  local.get $0
  i32.const 0
  i32.store offset=28
  local.get $0
  i32.const 0
  i32.store16 offset=32
  local.get $0
  i32.const 0
  i32.store offset=36
  local.get $0
  i32.const 0
  i32.store offset=40
  local.get $0
  i32.const 0
  i32.store offset=44
  local.get $0
  i32.const 0
  i32.store offset=48
  local.get $0
  global.set $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  i64.const 0
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  drop
  i64.const 1
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  drop
  i64.const 2
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  drop
  i64.const 3
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  drop
  i64.const 10
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  drop
  i64.const 4294967295
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.const 65535
  i32.and
  global.set $~lib/@btc-vision/btc-runtime/runtime/contracts/ReentrancyGuard/statusPointer
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.const 65535
  i32.and
  global.set $~lib/@btc-vision/btc-runtime/runtime/contracts/ReentrancyGuard/depthPointer
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/i128/i128#constructor
  i64.const 1
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/i128/i128#constructor
  i64.const -1
  i64.const -1
  call $~lib/@btc-vision/as-bignum/assembly/integer/i128/i128#constructor
  i64.const 0
  i64.const -9223372036854775808
  call $~lib/@btc-vision/as-bignum/assembly/integer/i128/i128#constructor
  i64.const -1
  i64.const 9223372036854775807
  call $~lib/@btc-vision/as-bignum/assembly/integer/i128/i128#constructor
  i32.const 3804
  i32.load
  i32.const 32
  i32.ne
  if
   unreachable
  end
  i32.const 3796
  i32.load
  local.tee $0
  i64.load
  local.get $0
  i64.load offset=8
  local.get $0
  i64.load offset=16
  local.get $0
  i64.load offset=24
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  drop
  i32.const 3916
  i32.load
  i32.const 32
  i32.ne
  if
   unreachable
  end
  i32.const 3908
  i32.load
  local.tee $0
  i64.load
  local.get $0
  i64.load offset=8
  local.get $0
  i64.load offset=16
  local.get $0
  i64.load offset=24
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  drop
  i32.const 4028
  i32.load
  i32.const 32
  i32.ne
  if
   unreachable
  end
  i32.const 4020
  i32.load
  local.tee $0
  i64.load
  local.get $0
  i64.load offset=8
  local.get $0
  i64.load offset=16
  local.get $0
  i64.load offset=24
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  drop
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/math/abi/encodePointer (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $1
  i32.load offset=8
  i32.const 30
  i32.lt_s
  if
   i32.const 0
   i32.const 30
   call $~lib/typedarray/Uint8Array#constructor
   local.set $4
   loop $for-loop|0
    local.get $2
    local.get $1
    i32.load offset=8
    i32.lt_s
    if
     local.get $4
     local.get $2
     local.get $1
     local.get $2
     call $~lib/typedarray/Uint8Array#__get
     call $~lib/typedarray/Uint8Array#__set
     local.get $2
     i32.const 1
     i32.add
     local.set $2
     br $for-loop|0
    end
   end
   local.get $4
   local.set $1
  end
  local.get $1
  i32.load offset=8
  i32.const 30
  i32.ne
  if
   unreachable
  end
  i32.const 0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
  local.tee $2
  i32.const 0
  local.get $0
  i32.const 65535
  i32.and
  i32.const 8
  i32.shr_u
  call $~lib/typedarray/Uint8Array#__set
  local.get $2
  i32.const 1
  local.get $0
  i32.const 255
  i32.and
  call $~lib/typedarray/Uint8Array#__set
  loop $for-loop|1
   local.get $3
   i32.const 30
   i32.lt_s
   if
    local.get $2
    local.get $3
    i32.const 2
    i32.add
    local.get $1
    local.get $3
    call $~lib/typedarray/Uint8Array#__get
    call $~lib/typedarray/Uint8Array#__set
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|1
   end
  end
  local.get $2
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#constructor (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  i32.const 16
  i32.const 36
  call $~lib/rt/stub/__new
  local.tee $2
  local.get $0
  i32.store16 offset=4
  local.get $2
  local.get $1
  i32.store offset=8
  local.get $2
  i32.const 0
  i32.store
  local.get $2
  i64.const 0
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  i32.store offset=12
  local.get $2
  local.get $0
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/math/abi/encodePointer
  i32.store
  local.get $2
 )
 (func $src/BlockBillContract/BlockBillContract#constructor (result i32)
  (local $0 i32)
  (local $1 i32)
  (local $2 i32)
  i32.const 64
  i32.const 33
  call $~lib/rt/stub/__new
  local.tee $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=16
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=18
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=20
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=22
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=24
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=26
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=28
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=30
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=32
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=34
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=36
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=38
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=40
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=42
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=44
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=46
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=48
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=50
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=52
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=54
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=56
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:nextPointer
  i32.store16 offset=58
  local.get $0
  local.get $0
  i32.load16_u offset=16
  global.get $~lib/@btc-vision/btc-runtime/runtime/math/bytes/EMPTY_POINTER
  call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#constructor
  i32.store offset=60
  local.get $0
  i32.eqz
  if
   i32.const 16
   i32.const 34
   call $~lib/rt/stub/__new
   local.set $0
  end
  local.get $0
  i32.const 0
  i32.store offset=4
  local.get $0
  i32.const 0
  i32.store offset=8
  local.get $0
  i32.const 0
  i32.store offset=12
  local.get $0
  i32.eqz
  if
   i32.const 4
   i32.const 18
   call $~lib/rt/stub/__new
   local.set $0
  end
  local.get $0
  i32.eqz
  if
   i32.const 0
   i32.const 0
   call $~lib/rt/stub/__new
   local.set $0
  end
  local.get $0
  i32.const 0
  i32.const 2
  i32.const 21
  i32.const 5408
  call $~lib/rt/__newArray
  i32.store
  global.get $~lib/@btc-vision/btc-runtime/runtime/contracts/ReentrancyGuard/statusPointer
  local.set $2
  i32.const 12
  i32.const 35
  call $~lib/rt/stub/__new
  local.tee $1
  local.get $2
  i32.store16 offset=4
  local.get $1
  i32.const 0
  i32.store
  local.get $1
  i32.const 0
  i32.store offset=8
  local.get $1
  local.get $2
  global.get $~lib/@btc-vision/btc-runtime/runtime/math/bytes/EMPTY_POINTER
  call $~lib/@btc-vision/btc-runtime/runtime/math/abi/encodePointer
  i32.store
  local.get $1
  i32.const 0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
  i32.store offset=8
  local.get $0
  local.get $1
  i32.store offset=4
  local.get $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/contracts/ReentrancyGuard/depthPointer
  global.get $~lib/@btc-vision/btc-runtime/runtime/math/bytes/EMPTY_POINTER
  call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#constructor
  i32.store offset=8
  local.get $0
 )
 (func $start:src/index~anonymous|0 (result i32)
  call $src/BlockBillContract/BlockBillContract#constructor
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#createContractIfNotExists (param $0 i32)
  local.get $0
  i32.load offset=28
  i32.eqz
  if
   unreachable
  end
  local.get $0
  i32.load offset=12
  i32.eqz
  if
   i32.const 0
   global.set $~argumentsLength
   local.get $0
   local.get $0
   i32.load offset=28
   i32.load
   call_indirect $0 (type $4)
   i32.store offset=12
  end
 )
 (func $~lib/util/number/utoa32 (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  i32.eqz
  if
   i32.const 5680
   return
  end
  local.get $0
  i32.const 100000
  i32.lt_u
  if (result i32)
   local.get $0
   i32.const 10
   i32.ge_u
   i32.const 1
   i32.add
   local.get $0
   i32.const 10000
   i32.ge_u
   i32.const 3
   i32.add
   local.get $0
   i32.const 1000
   i32.ge_u
   i32.add
   local.get $0
   i32.const 100
   i32.lt_u
   select
  else
   local.get $0
   i32.const 1000000
   i32.ge_u
   i32.const 6
   i32.add
   local.get $0
   i32.const 1000000000
   i32.ge_u
   i32.const 8
   i32.add
   local.get $0
   i32.const 100000000
   i32.ge_u
   i32.add
   local.get $0
   i32.const 10000000
   i32.lt_u
   select
  end
  local.tee $1
  i32.const 1
  i32.shl
  i32.const 2
  call $~lib/rt/stub/__new
  local.set $2
  loop $do-loop|0
   local.get $2
   local.get $1
   i32.const 1
   i32.sub
   local.tee $1
   i32.const 1
   i32.shl
   i32.add
   local.get $0
   i32.const 10
   i32.rem_u
   i32.const 48
   i32.add
   i32.store16
   local.get $0
   i32.const 10
   i32.div_u
   local.tee $0
   br_if $do-loop|0
  end
  local.get $2
 )
 (func $~lib/staticarray/StaticArray<~lib/string/String>#__uset (param $0 i32) (param $1 i32)
  local.get $0
  i32.const 2
  i32.shl
  i32.const 5632
  i32.add
  local.get $1
  i32.store
 )
 (func $~lib/string/String.__concat (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  i32.const 5808
  local.set $2
  local.get $0
  i32.const 20
  i32.sub
  i32.load offset=16
  i32.const -2
  i32.and
  local.tee $3
  local.get $1
  i32.const 20
  i32.sub
  i32.load offset=16
  i32.const -2
  i32.and
  local.tee $4
  i32.add
  local.tee $5
  if
   local.get $5
   i32.const 2
   call $~lib/rt/stub/__new
   local.tee $2
   local.get $0
   local.get $3
   memory.copy
   local.get $2
   local.get $3
   i32.add
   local.get $1
   local.get $4
   memory.copy
  end
  local.get $2
 )
 (func $~lib/string/String.UTF8.encodeUnsafe (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $0
  local.get $1
  i32.const 1
  i32.shl
  i32.add
  local.set $3
  local.get $2
  local.set $1
  loop $while-continue|0
   local.get $0
   local.get $3
   i32.lt_u
   if
    local.get $0
    i32.load16_u
    local.tee $2
    i32.const 128
    i32.lt_u
    if (result i32)
     local.get $1
     local.get $2
     i32.store8
     local.get $1
     i32.const 1
     i32.add
    else
     local.get $2
     i32.const 2048
     i32.lt_u
     if (result i32)
      local.get $1
      local.get $2
      i32.const 6
      i32.shr_u
      i32.const 192
      i32.or
      local.get $2
      i32.const 63
      i32.and
      i32.const 128
      i32.or
      i32.const 8
      i32.shl
      i32.or
      i32.store16
      local.get $1
      i32.const 2
      i32.add
     else
      local.get $2
      i32.const 56320
      i32.lt_u
      local.get $0
      i32.const 2
      i32.add
      local.get $3
      i32.lt_u
      i32.and
      local.get $2
      i32.const 63488
      i32.and
      i32.const 55296
      i32.eq
      i32.and
      if
       local.get $0
       i32.load16_u offset=2
       local.tee $4
       i32.const 64512
       i32.and
       i32.const 56320
       i32.eq
       if
        local.get $1
        local.get $2
        i32.const 1023
        i32.and
        i32.const 10
        i32.shl
        i32.const 65536
        i32.add
        local.get $4
        i32.const 1023
        i32.and
        i32.or
        local.tee $2
        i32.const 63
        i32.and
        i32.const 128
        i32.or
        i32.const 24
        i32.shl
        local.get $2
        i32.const 6
        i32.shr_u
        i32.const 63
        i32.and
        i32.const 128
        i32.or
        i32.const 16
        i32.shl
        i32.or
        local.get $2
        i32.const 12
        i32.shr_u
        i32.const 63
        i32.and
        i32.const 128
        i32.or
        i32.const 8
        i32.shl
        i32.or
        local.get $2
        i32.const 18
        i32.shr_u
        i32.const 240
        i32.or
        i32.or
        i32.store
        local.get $1
        i32.const 4
        i32.add
        local.set $1
        local.get $0
        i32.const 4
        i32.add
        local.set $0
        br $while-continue|0
       end
      end
      local.get $1
      local.get $2
      i32.const 12
      i32.shr_u
      i32.const 224
      i32.or
      local.get $2
      i32.const 6
      i32.shr_u
      i32.const 63
      i32.and
      i32.const 128
      i32.or
      i32.const 8
      i32.shl
      i32.or
      i32.store16
      local.get $1
      local.get $2
      i32.const 63
      i32.and
      i32.const 128
      i32.or
      i32.store8 offset=2
      local.get $1
      i32.const 3
      i32.add
     end
    end
    local.set $1
    local.get $0
    i32.const 2
    i32.add
    local.set $0
    br $while-continue|0
   end
  end
 )
 (func $~lib/string/String.UTF8.encode@varargs (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  block $2of2
   block $outOfRange
    global.get $~argumentsLength
    i32.const 1
    i32.sub
    br_table $2of2 $2of2 $2of2 $outOfRange
   end
   unreachable
  end
  local.get $0
  local.tee $1
  i32.const 20
  i32.sub
  i32.load offset=16
  local.get $1
  i32.add
  local.set $3
  loop $while-continue|0
   local.get $1
   local.get $3
   i32.lt_u
   if
    local.get $1
    i32.load16_u
    local.tee $4
    i32.const 128
    i32.lt_u
    if (result i32)
     local.get $2
     i32.const 1
     i32.add
    else
     local.get $4
     i32.const 2048
     i32.lt_u
     if (result i32)
      local.get $2
      i32.const 2
      i32.add
     else
      local.get $4
      i32.const 64512
      i32.and
      i32.const 55296
      i32.eq
      local.get $1
      i32.const 2
      i32.add
      local.get $3
      i32.lt_u
      i32.and
      if
       local.get $1
       i32.load16_u offset=2
       i32.const 64512
       i32.and
       i32.const 56320
       i32.eq
       if
        local.get $2
        i32.const 4
        i32.add
        local.set $2
        local.get $1
        i32.const 4
        i32.add
        local.set $1
        br $while-continue|0
       end
      end
      local.get $2
      i32.const 3
      i32.add
     end
    end
    local.set $2
    local.get $1
    i32.const 2
    i32.add
    local.set $1
    br $while-continue|0
   end
  end
  local.get $2
  i32.const 1
  call $~lib/rt/stub/__new
  local.set $1
  local.get $0
  local.get $0
  i32.const 20
  i32.sub
  i32.load offset=16
  i32.const 1
  i32.shr_u
  local.get $1
  call $~lib/string/String.UTF8.encodeUnsafe
  local.get $1
 )
 (func $~lib/dataview/DataView#constructor@varargs (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  block $2of2
   block $1of2
    block $outOfRange
     global.get $~argumentsLength
     i32.const 1
     i32.sub
     br_table $1of2 $1of2 $2of2 $outOfRange
    end
    unreachable
   end
   local.get $0
   i32.const 20
   i32.sub
   i32.load offset=16
   local.set $2
  end
  i32.const 12
  i32.const 39
  call $~lib/rt/stub/__new
  local.tee $1
  i32.const 0
  i32.store
  local.get $1
  i32.const 0
  i32.store offset=4
  local.get $1
  i32.const 0
  i32.store offset=8
  local.get $2
  local.get $0
  i32.const 20
  i32.sub
  i32.load offset=16
  i32.gt_u
  local.get $2
  i32.const 1073741820
  i32.gt_u
  i32.or
  if
   unreachable
  end
  local.get $1
  local.get $0
  i32.store
  local.get $1
  local.get $0
  i32.store offset=4
  local.get $1
  local.get $2
  i32.store offset=8
  local.get $1
 )
 (func $~lib/polyfills/bswap<u32> (param $0 i32) (result i32)
  local.get $0
  i32.const -16711936
  i32.and
  i32.const 8
  i32.rotl
  local.get $0
  i32.const 16711935
  i32.and
  i32.const 8
  i32.rotr
  i32.or
 )
 (func $~lib/dataview/DataView#setUint32 (param $0 i32) (param $1 i32) (param $2 i32)
  local.get $1
  i32.const 31
  i32.shr_u
  local.get $0
  i32.load offset=8
  local.get $1
  i32.const 4
  i32.add
  i32.lt_s
  i32.or
  if
   unreachable
  end
  local.get $0
  i32.load offset=4
  local.get $1
  i32.add
  local.get $2
  call $~lib/polyfills/bswap<u32>
  i32.store
 )
 (func $src/index/abort (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $2
  call $~lib/util/number/utoa32
  local.set $2
  local.get $3
  call $~lib/util/number/utoa32
  local.set $3
  i32.const 0
  local.get $0
  call $~lib/staticarray/StaticArray<~lib/string/String>#__uset
  i32.const 2
  local.get $1
  call $~lib/staticarray/StaticArray<~lib/string/String>#__uset
  i32.const 4
  local.get $2
  call $~lib/staticarray/StaticArray<~lib/string/String>#__uset
  i32.const 6
  local.get $3
  call $~lib/staticarray/StaticArray<~lib/string/String>#__uset
  block $__inlined_func$~lib/util/string/joinReferenceArray<~lib/string/String>$12 (result i32)
   i32.const 0
   local.set $1
   i32.const 5808
   i32.const 5628
   i32.load
   i32.const 2
   i32.shr_u
   i32.const 1
   i32.sub
   local.tee $3
   i32.const 0
   i32.lt_s
   br_if $__inlined_func$~lib/util/string/joinReferenceArray<~lib/string/String>$12
   drop
   local.get $3
   i32.eqz
   if
    i32.const 5632
    i32.load
    local.tee $0
    i32.const 5808
    local.get $0
    select
    br $__inlined_func$~lib/util/string/joinReferenceArray<~lib/string/String>$12
   end
   i32.const 5808
   local.set $0
   i32.const 5804
   i32.load
   i32.const 1
   i32.shr_u
   local.set $5
   loop $for-loop|0
    local.get $1
    local.get $3
    i32.lt_s
    if
     local.get $1
     i32.const 2
     i32.shl
     i32.const 5632
     i32.add
     i32.load
     local.tee $2
     if
      local.get $0
      local.get $2
      call $~lib/string/String.__concat
      local.set $0
     end
     local.get $5
     if
      local.get $0
      i32.const 5808
      call $~lib/string/String.__concat
      local.set $0
     end
     local.get $1
     i32.const 1
     i32.add
     local.set $1
     br $for-loop|0
    end
   end
   local.get $3
   i32.const 2
   i32.shl
   i32.const 5632
   i32.add
   i32.load
   local.tee $1
   if (result i32)
    local.get $0
    local.get $1
    call $~lib/string/String.__concat
   else
    local.get $0
   end
  end
  i32.const 1
  global.set $~argumentsLength
  call $~lib/string/String.UTF8.encode@varargs
  i32.const 1
  global.set $~argumentsLength
  call $~lib/typedarray/Uint8Array.wrap@varargs
  local.tee $0
  i32.load offset=8
  i32.const 8
  i32.add
  call $~lib/arraybuffer/ArrayBuffer#constructor
  local.set $1
  i32.const 1
  global.set $~argumentsLength
  local.get $1
  call $~lib/dataview/DataView#constructor@varargs
  local.tee $2
  i32.const 0
  i32.const 1668521308
  call $~lib/dataview/DataView#setUint32
  local.get $2
  i32.const 4
  local.get $0
  i32.load offset=8
  call $~lib/dataview/DataView#setUint32
  loop $for-loop|00
   local.get $4
   local.get $0
   i32.load offset=8
   i32.lt_s
   if
    local.get $2
    local.get $4
    i32.const 8
    i32.add
    local.get $0
    local.get $4
    call $~lib/typedarray/Uint8Array#__get
    call $~lib/typedarray/Uint8Array#__set
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|00
   end
  end
  i32.const 1
  local.get $1
  local.get $1
  i32.const 20
  i32.sub
  i32.load offset=16
  call $~lib/@btc-vision/btc-runtime/runtime/env/global/env_exit
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#constructor (param $0 i32) (result i32)
  (local $1 i32)
  i32.const 8
  i32.const 40
  call $~lib/rt/stub/__new
  local.tee $1
  i32.const 0
  i32.store
  local.get $1
  i32.const 0
  i32.store offset=4
  local.get $0
  i32.load
  local.set $0
  i32.const 1
  global.set $~argumentsLength
  local.get $1
  local.get $0
  call $~lib/dataview/DataView#constructor@varargs
  i32.store
  local.get $1
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#verifyEnd (param $0 i32) (param $1 i32)
  local.get $1
  local.get $0
  i32.load
  i32.load offset=8
  i32.gt_s
  if
   unreachable
  end
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU8 (param $0 i32) (result i32)
  (local $1 i32)
  local.get $0
  local.get $0
  i32.load offset=4
  i32.const 1
  i32.add
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#verifyEnd
  local.get $0
  i32.load
  local.get $0
  i32.load offset=4
  call $~lib/typedarray/Uint8Array#__get
  local.get $0
  local.get $0
  i32.load offset=4
  i32.const 1
  i32.add
  i32.store offset=4
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readBytes (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  i32.const 0
  local.get $1
  call $~lib/typedarray/Uint8Array#constructor
  local.set $3
  loop $for-loop|0
   local.get $1
   local.get $4
   i32.gt_u
   if
    block $for-break0
     local.get $0
     call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU8
     local.tee $5
     i32.const 1
     local.get $2
     select
     i32.eqz
     if
      local.get $3
      local.tee $0
      i32.load offset=8
      local.tee $1
      i32.const 0
      local.get $1
      i32.const 0
      i32.le_s
      select
      local.set $2
      i32.const 12
      i32.const 7
      call $~lib/rt/stub/__new
      local.tee $3
      local.get $0
      i32.load
      i32.store
      local.get $3
      local.get $0
      i32.load offset=4
      local.get $2
      i32.add
      i32.store offset=4
      local.get $3
      local.get $4
      i32.const 0
      i32.lt_s
      if (result i32)
       local.get $1
       local.get $4
       i32.add
       local.tee $0
       i32.const 0
       local.get $0
       i32.const 0
       i32.gt_s
       select
      else
       local.get $4
       local.get $1
       local.get $1
       local.get $4
       i32.gt_s
       select
      end
      local.tee $0
      local.get $2
      local.get $0
      local.get $2
      i32.gt_s
      select
      local.get $2
      i32.sub
      i32.store offset=8
      br $for-break0
     end
     local.get $3
     local.get $4
     local.get $5
     call $~lib/typedarray/Uint8Array#__set
     local.get $4
     i32.const 1
     i32.add
     local.set $4
     br $for-loop|0
    end
   end
  end
  local.get $3
 )
 (func $~lib/polyfills/bswap<u64> (param $0 i64) (result i64)
  local.get $0
  i64.const 8
  i64.shr_u
  i64.const 71777214294589695
  i64.and
  local.get $0
  i64.const 71777214294589695
  i64.and
  i64.const 8
  i64.shl
  i64.or
  local.tee $0
  i64.const 16
  i64.shr_u
  i64.const 281470681808895
  i64.and
  local.get $0
  i64.const 281470681808895
  i64.and
  i64.const 16
  i64.shl
  i64.or
  i64.const 32
  i64.rotr
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU64 (param $0 i32) (result i64)
  (local $1 i32)
  (local $2 i32)
  (local $3 i64)
  local.get $0
  local.get $0
  i32.load offset=4
  i32.const 8
  i32.add
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#verifyEnd
  local.get $0
  i32.load offset=4
  local.tee $1
  i32.const 31
  i32.shr_u
  local.get $0
  i32.load
  local.tee $2
  i32.load offset=8
  local.get $1
  i32.const 8
  i32.add
  i32.lt_s
  i32.or
  if
   unreachable
  end
  local.get $1
  local.get $2
  i32.load offset=4
  i32.add
  i64.load
  call $~lib/polyfills/bswap<u64>
  local.get $0
  local.get $0
  i32.load offset=4
  i32.const 8
  i32.add
  i32.store offset=4
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readAddress (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  local.get $0
  i32.load offset=4
  i32.const 32
  i32.add
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#verifyEnd
  i32.const 0
  i32.const 0
  i32.const 0
  i32.const 8
  i32.const 5840
  call $~lib/rt/__newArray
  call $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#constructor
  local.set $1
  loop $for-loop|0
   local.get $2
   i32.const 32
   i32.lt_s
   if
    local.get $0
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU8
    local.set $3
    local.get $1
    i32.load8_u offset=12
    if
     unreachable
    end
    local.get $2
    local.get $1
    i32.load offset=8
    i32.ge_u
    if
     unreachable
    end
    local.get $2
    local.get $1
    i32.load offset=4
    i32.add
    local.get $3
    i32.store8
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $1
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/script/Networks/NetworkManager#equals (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  local.get $0
  i32.load offset=8
  local.get $1
  i32.load offset=8
  i32.ne
  if
   i32.const 0
   return
  end
  loop $for-loop|0
   local.get $2
   local.get $0
   i32.load offset=8
   i32.lt_s
   if
    local.get $0
    local.get $2
    call $~lib/typedarray/Uint8Array#__get
    local.get $1
    local.get $2
    call $~lib/typedarray/Uint8Array#__get
    i32.ne
    if
     i32.const 0
     return
    end
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  i32.const 1
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#setEnvironmentVariables (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i64)
  (local $4 i64)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i64)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#constructor
  local.tee $12
  i32.const 32
  i32.const 0
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readBytes
  local.set $1
  local.get $12
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU64
  local.set $3
  local.get $12
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU64
  local.set $4
  local.get $12
  i32.const 32
  i32.const 0
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readBytes
  local.set $14
  local.get $12
  i32.const 32
  i32.const 0
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readBytes
  local.set $5
  local.get $12
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readAddress
  local.set $6
  local.get $12
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readAddress
  local.set $7
  local.get $12
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readAddress
  local.set $8
  i32.const 32
  call $~lib/array/Array<u8>#constructor
  local.set $13
  loop $for-loop|0
   local.get $2
   i32.const 32
   i32.lt_s
   if
    local.get $13
    local.get $2
    local.get $12
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU8
    call $~lib/array/Array<u8>#__set
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $12
  i32.const 32
  i32.const 0
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readBytes
  local.set $9
  local.get $12
  i32.const 32
  i32.const 0
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readBytes
  local.set $10
  i32.const 32
  call $~lib/array/Array<u8>#constructor
  local.set $15
  i32.const 0
  local.set $2
  loop $for-loop|1
   local.get $2
   i32.const 32
   i32.lt_s
   if
    local.get $15
    local.get $2
    local.get $12
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU8
    call $~lib/array/Array<u8>#__set
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|1
   end
  end
  local.get $12
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU64
  local.set $11
  local.get $15
  local.get $13
  call $~lib/@btc-vision/btc-runtime/runtime/types/ExtendedAddress/ExtendedAddress#constructor
  local.set $2
  i32.const 32
  i32.const 24
  call $~lib/rt/stub/__new
  local.tee $12
  local.get $14
  i32.store offset=16
  local.get $12
  local.get $5
  i32.store offset=20
  local.get $12
  i32.const 0
  i32.store
  local.get $12
  i32.const 0
  i32.store offset=4
  local.get $12
  i32.const 0
  i32.store offset=8
  local.get $12
  i32.const 0
  i32.const 26
  call $~lib/rt/stub/__new
  local.tee $5
  if (result i32)
   local.get $5
  else
   i32.const 0
   i32.const 0
   call $~lib/rt/stub/__new
  end
  i32.store offset=12
  local.get $12
  i32.const 0
  i32.store offset=24
  local.get $12
  i32.const 0
  i32.store offset=28
  local.get $12
  local.get $8
  i32.store offset=4
  local.get $12
  local.get $2
  i32.store offset=8
  i32.const 8
  i32.const 25
  call $~lib/rt/stub/__new
  local.tee $2
  i64.const 0
  i64.store
  local.get $2
  local.get $11
  i64.store
  local.get $12
  local.get $2
  i32.store
  local.get $0
  local.get $12
  i32.store offset=24
  local.get $0
  local.get $7
  i32.store offset=36
  local.get $0
  local.get $6
  i32.store offset=40
  local.get $0
  local.get $9
  i32.store offset=44
  local.get $0
  local.get $10
  i32.store offset=48
  local.get $0
  i32.load offset=44
  i32.eqz
  if
   unreachable
  end
  local.get $0
  i32.load offset=44
  local.tee $5
  i32.eqz
  if
   unreachable
  end
  local.get $5
  i32.load offset=8
  i32.const 32
  i32.ne
  if
   unreachable
  end
  i32.const 0
  local.set $2
  block $__inlined_func$~lib/@btc-vision/btc-runtime/runtime/script/Networks/NetworkManager#fromChainId$808
   local.get $5
   global.get $~lib/@btc-vision/btc-runtime/runtime/script/Networks/Network
   local.tee $6
   i32.load
   call $~lib/@btc-vision/btc-runtime/runtime/script/Networks/NetworkManager#equals
   br_if $__inlined_func$~lib/@btc-vision/btc-runtime/runtime/script/Networks/NetworkManager#fromChainId$808
   i32.const 1
   local.set $2
   local.get $5
   local.get $6
   i32.load offset=4
   call $~lib/@btc-vision/btc-runtime/runtime/script/Networks/NetworkManager#equals
   br_if $__inlined_func$~lib/@btc-vision/btc-runtime/runtime/script/Networks/NetworkManager#fromChainId$808
   i32.const 2
   local.set $2
   local.get $5
   local.get $6
   i32.load offset=12
   call $~lib/@btc-vision/btc-runtime/runtime/script/Networks/NetworkManager#equals
   br_if $__inlined_func$~lib/@btc-vision/btc-runtime/runtime/script/Networks/NetworkManager#fromChainId$808
   i32.const 3
   local.set $2
   local.get $5
   local.get $6
   i32.load offset=8
   call $~lib/@btc-vision/btc-runtime/runtime/script/Networks/NetworkManager#equals
   br_if $__inlined_func$~lib/@btc-vision/btc-runtime/runtime/script/Networks/NetworkManager#fromChainId$808
   unreachable
  end
  local.get $0
  local.get $2
  i32.store offset=16
  i32.const 24
  i32.const 22
  call $~lib/rt/stub/__new
  local.tee $2
  local.get $1
  i32.store offset=4
  local.get $2
  local.get $3
  i64.store offset=8
  local.get $2
  local.get $4
  i64.store offset=16
  local.get $2
  i32.const 0
  i32.store
  local.get $2
  block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU64|inlined.0 (result i32)
   local.get $3
   i64.eqz
   if
    i64.const 0
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU64|inlined.0
   end
   local.get $3
   i64.const 1
   i64.eq
   if
    i64.const 1
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU64|inlined.0
   end
   local.get $3
   i64.const 0
   i64.const 0
   i64.const 0
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  end
  i32.store
  local.get $0
  local.get $2
  i32.store offset=20
  local.get $0
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#createContractIfNotExists
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU32 (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  local.get $0
  i32.load offset=4
  i32.const 4
  i32.add
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#verifyEnd
  local.get $0
  i32.load offset=4
  local.tee $1
  i32.const 31
  i32.shr_u
  local.get $0
  i32.load
  local.tee $2
  i32.load offset=8
  local.get $1
  i32.const 4
  i32.add
  i32.lt_s
  i32.or
  if
   unreachable
  end
  local.get $1
  local.get $2
  i32.load offset=4
  i32.add
  i32.load
  call $~lib/polyfills/bswap<u32>
  local.get $0
  local.get $0
  i32.load offset=4
  i32.const 4
  i32.add
  i32.store offset=4
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:contract (param $0 i32) (result i32)
  local.get $0
  i32.load offset=12
  local.tee $0
  i32.eqz
  if
   unreachable
  end
  local.get $0
 )
 (func $~lib/array/Array<~lib/@btc-vision/btc-runtime/runtime/plugins/Plugin/Plugin>#__get (param $0 i32) (param $1 i32) (result i32)
  local.get $1
  local.get $0
  i32.load offset=12
  i32.ge_u
  if
   unreachable
  end
  local.get $0
  i32.load offset=4
  local.get $1
  i32.const 2
  i32.shl
  i32.add
  i32.load
  local.tee $0
  i32.eqz
  if
   unreachable
  end
  local.get $0
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#onExecutionStarted (param $0 i32)
  (local $1 i32)
  loop $for-loop|0
   local.get $1
   local.get $0
   i32.load
   i32.load offset=12
   i32.lt_s
   if
    local.get $0
    i32.load
    local.get $1
    call $~lib/array/Array<~lib/@btc-vision/btc-runtime/runtime/plugins/Plugin/Plugin>#__get
    drop
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|0
   end
  end
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#onExecutionStarted (param $0 i32) (param $1 i32)
  (local $2 i32)
  block $__inlined_func$~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#onExecutionStarted@override$200
   local.get $0
   call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:contract
   local.tee $0
   i32.const 8
   i32.sub
   i32.load
   local.tee $2
   i32.const 34
   i32.eq
   local.get $2
   i32.const 33
   i32.eq
   i32.or
   if
    local.get $0
    call $~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#onExecutionStarted
    local.get $0
    local.get $1
    call $~lib/@btc-vision/btc-runtime/runtime/contracts/ReentrancyGuard/ReentrancyGuard#isSelectorExcluded@override
    i32.eqz
    if
     local.get $0
     i32.load offset=12
     if
      local.get $0
      i32.load offset=12
      i32.const 1
      i32.eq
      if
       local.get $0
       i32.load offset=8
       call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#get:value
       local.tee $1
       i64.const 1
       i64.const 0
       i64.const 0
       i64.const 0
       call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
       call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.lt
       i32.eqz
       if
        unreachable
       end
       local.get $0
       i32.load offset=8
       local.get $1
       i64.const 1
       i64.const 0
       i64.const 0
       i64.const 0
       call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
       call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.add
       call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#set:value
       local.get $1
       i64.load offset=24
       local.get $1
       i64.load offset=16
       local.get $1
       i64.load
       local.get $1
       i64.load offset=8
       i64.or
       i64.or
       i64.or
       i64.eqz
       if
        local.get $0
        i32.load offset=4
        i32.const 1
        call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredBoolean/StoredBoolean#set:value
       end
      end
     else
      local.get $0
      i32.load offset=4
      local.tee $1
      global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
      local.get $1
      i32.load
      call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#getStorageAt
      i32.store offset=8
      local.get $1
      i32.load offset=8
      i32.const 0
      call $~lib/typedarray/Uint8Array#__get
      i32.const 1
      i32.eq
      if
       unreachable
      end
      local.get $0
      i32.load offset=4
      i32.const 1
      call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredBoolean/StoredBoolean#set:value
     end
    end
    br $__inlined_func$~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#onExecutionStarted@override$200
   end
   local.get $0
   call $~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#onExecutionStarted
  end
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/math/abi/encodeSelector (param $0 i32) (result i32)
  (local $1 i32)
  i32.const 1
  global.set $~argumentsLength
  local.get $0
  call $~lib/string/String.UTF8.encode@varargs
  i32.const 1
  global.set $~argumentsLength
  call $~lib/typedarray/Uint8Array.wrap@varargs
  local.set $0
  i32.const 32
  call $~lib/arraybuffer/ArrayBuffer#constructor
  local.set $1
  local.get $0
  i32.load
  local.get $0
  i32.load offset=8
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/env/global/_sha256
  i32.const 1
  global.set $~argumentsLength
  local.get $1
  call $~lib/typedarray/Uint8Array.wrap@varargs
  local.tee $0
  i32.load offset=8
  i32.const 4
  i32.lt_s
  if
   unreachable
  end
  local.get $0
  i32.const 0
  call $~lib/typedarray/Uint8Array#__get
  i32.const 24
  i32.shl
  local.get $0
  i32.const 1
  call $~lib/typedarray/Uint8Array#__get
  i32.const 16
  i32.shl
  i32.or
  local.get $0
  i32.const 2
  call $~lib/typedarray/Uint8Array#__get
  i32.const 8
  i32.shl
  i32.or
  local.get $0
  i32.const 3
  call $~lib/typedarray/Uint8Array#__get
  i32.or
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#constructor (param $0 i32) (result i32)
  (local $1 i32)
  i32.const 12
  i32.const 41
  call $~lib/rt/stub/__new
  local.tee $1
  i32.const 0
  i32.store
  local.get $1
  i32.const 0
  i32.store offset=4
  local.get $1
  i32.const 0
  i32.store offset=8
  local.get $1
  i32.const 0
  local.get $0
  call $~lib/typedarray/Uint8Array#constructor
  local.tee $0
  i32.store offset=8
  local.get $0
  i32.load
  local.set $0
  i32.const 1
  global.set $~argumentsLength
  local.get $1
  local.get $0
  call $~lib/dataview/DataView#constructor@varargs
  i32.store offset=4
  local.get $1
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#allocSafe (param $0 i32) (param $1 i32)
  local.get $1
  i32.const -1
  local.get $0
  i32.load
  i32.sub
  i32.gt_u
  if
   unreachable
  end
  local.get $0
  i32.load offset=4
  i32.load offset=8
  local.get $1
  local.get $0
  i32.load
  i32.add
  i32.lt_u
  if
   unreachable
  end
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU8 (param $0 i32) (param $1 i32)
  local.get $0
  i32.const 1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#allocSafe
  local.get $0
  i32.load offset=4
  local.get $0
  i32.load
  local.get $1
  call $~lib/typedarray/Uint8Array#__set
  local.get $0
  local.get $0
  i32.load
  i32.const 1
  i32.add
  i32.store
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeBytes (param $0 i32) (param $1 i32)
  (local $2 i32)
  local.get $0
  local.get $1
  i32.load offset=8
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#allocSafe
  loop $for-loop|0
   local.get $2
   local.get $1
   i32.load offset=8
   i32.lt_s
   if
    local.get $0
    local.get $1
    local.get $2
    call $~lib/typedarray/Uint8Array#__get
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU8
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeAddress (param $0 i32) (param $1 i32)
  local.get $1
  i32.load offset=8
  i32.const 32
  i32.gt_s
  if
   unreachable
  end
  local.get $0
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeBytes
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#execute (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  (local $3 i32)
  i32.const 6000
  call $~lib/@btc-vision/btc-runtime/runtime/math/abi/encodeSelector
  local.get $1
  i32.eq
  if
   i32.const 32
   call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#constructor
   local.set $0
   global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
   local.tee $1
   i32.load offset=36
   i32.eqz
   if
    unreachable
   end
   local.get $1
   i32.load offset=36
   local.tee $1
   i32.eqz
   if
    unreachable
   end
   local.get $0
   local.get $1
   call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeAddress
   local.get $0
   return
  end
  local.get $2
  i32.load offset=4
  local.set $3
  i32.const 0
  local.set $1
  loop $for-loop|1
   local.get $1
   local.get $0
   i32.load
   i32.load offset=12
   i32.lt_s
   if
    local.get $0
    i32.load
    local.get $1
    call $~lib/array/Array<~lib/@btc-vision/btc-runtime/runtime/plugins/Plugin/Plugin>#__get
    i32.const 8
    i32.sub
    i32.load
    drop
    local.get $2
    local.get $3
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#verifyEnd
    local.get $2
    local.get $3
    i32.store offset=4
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|1
   end
  end
  unreachable
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#onExecutionCompleted (param $0 i32) (param $1 i32)
  (local $2 i32)
  block $__inlined_func$~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#onExecutionCompleted@override$224
   local.get $0
   call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:contract
   local.tee $0
   i32.const 8
   i32.sub
   i32.load
   local.tee $2
   i32.const 34
   i32.eq
   local.get $2
   i32.const 33
   i32.eq
   i32.or
   if
    local.get $0
    call $~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#onExecutionStarted
    local.get $0
    local.get $1
    call $~lib/@btc-vision/btc-runtime/runtime/contracts/ReentrancyGuard/ReentrancyGuard#isSelectorExcluded@override
    i32.eqz
    if
     local.get $0
     i32.load offset=12
     if
      local.get $0
      i32.load offset=12
      i32.const 1
      i32.eq
      if
       local.get $0
       i32.load offset=8
       call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#get:value
       local.tee $1
       i64.load offset=24
       local.get $1
       i64.load offset=16
       local.get $1
       i64.load
       local.get $1
       i64.load offset=8
       i64.or
       i64.or
       i64.or
       i64.eqz
       if
        unreachable
       end
       local.get $1
       i64.const 1
       i64.const 0
       i64.const 0
       i64.const 0
       call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
       call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.sub
       local.set $1
       local.get $0
       i32.load offset=8
       local.get $1
       call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#set:value
       local.get $1
       i64.load offset=24
       local.get $1
       i64.load offset=16
       local.get $1
       i64.load
       local.get $1
       i64.load offset=8
       i64.or
       i64.or
       i64.or
       i64.eqz
       if
        local.get $0
        i32.load offset=4
        i32.const 0
        call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredBoolean/StoredBoolean#set:value
       end
      end
     else
      local.get $0
      i32.load offset=4
      i32.const 0
      call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredBoolean/StoredBoolean#set:value
     end
    end
    br $__inlined_func$~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#onExecutionCompleted@override$224
   end
   local.get $0
   call $~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#onExecutionStarted
  end
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/exports/index/execute (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  i32.const 0
  i32.const 512
  i32.const 512
  call $~lib/arraybuffer/ArrayBuffer#constructor
  local.tee $1
  call $~lib/@btc-vision/btc-runtime/runtime/env/global/getEnvironmentVariables
  i32.const 1
  global.set $~argumentsLength
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.get $1
  call $~lib/typedarray/Uint8Array.wrap@varargs
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#setEnvironmentVariables
  i32.const 0
  local.get $0
  local.get $0
  call $~lib/arraybuffer/ArrayBuffer#constructor
  local.tee $0
  call $~lib/@btc-vision/btc-runtime/runtime/env/global/getCalldata
  i32.const 1
  global.set $~argumentsLength
  local.get $0
  call $~lib/typedarray/Uint8Array.wrap@varargs
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#constructor
  local.tee $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU32
  local.set $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.get $0
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#onExecutionStarted
  block $__inlined_func$~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#execute@override$227 (result i32)
   global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
   call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:contract
   local.tee $2
   i32.const 8
   i32.sub
   i32.load
   i32.const 33
   i32.eq
   if
    local.get $2
    local.get $0
    local.get $1
    call $src/BlockBillContract/BlockBillContract#execute
    br $__inlined_func$~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#execute@override$227
   end
   local.get $2
   local.get $0
   local.get $1
   call $~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#execute
  end
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.get $0
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#onExecutionCompleted
  i32.load offset=8
  i32.load
  local.tee $0
  i32.const 20
  i32.sub
  i32.load offset=16
  local.tee $1
  i32.const 0
  i32.gt_s
  if
   i32.const 0
   local.get $0
   local.get $1
   call $~lib/@btc-vision/btc-runtime/runtime/env/global/env_exit
  end
  i32.const 0
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/exports/index/onDeploy (param $0 i32) (result i32)
  (local $1 i32)
  i32.const 0
  i32.const 512
  i32.const 512
  call $~lib/arraybuffer/ArrayBuffer#constructor
  local.tee $1
  call $~lib/@btc-vision/btc-runtime/runtime/env/global/getEnvironmentVariables
  i32.const 1
  global.set $~argumentsLength
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.get $1
  call $~lib/typedarray/Uint8Array.wrap@varargs
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#setEnvironmentVariables
  i32.const 0
  local.get $0
  local.get $0
  call $~lib/arraybuffer/ArrayBuffer#constructor
  local.tee $0
  call $~lib/@btc-vision/btc-runtime/runtime/env/global/getCalldata
  i32.const 1
  global.set $~argumentsLength
  local.get $0
  call $~lib/typedarray/Uint8Array.wrap@varargs
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#constructor
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  i32.const 0
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#onExecutionStarted
  block $__inlined_func$~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#onDeployment@override$232
   global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
   call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:contract
   local.tee $0
   i32.const 8
   i32.sub
   i32.load
   i32.const 33
   i32.eq
   if
    global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
    local.tee $1
    i32.load offset=24
    i32.eqz
    if
     unreachable
    end
    local.get $1
    i32.load offset=24
    local.tee $1
    i32.eqz
    if
     unreachable
    end
    local.get $1
    i32.load offset=4
    local.set $1
    local.get $0
    i32.load16_u offset=20
    i64.const 0
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    local.get $1
    call $src/BlockBillContract/BlockBillContract#storeAddressAt
    local.get $0
    i32.load16_u offset=18
    i64.const 0
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    local.get $1
    call $src/BlockBillContract/BlockBillContract#storeAddressAt
    br $__inlined_func$~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#onDeployment@override$232
   end
   local.get $0
   call $~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#onExecutionStarted
  end
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  i32.const 0
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#onExecutionCompleted
  i32.const 0
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/exports/index/onUpdate (param $0 i32) (result i32)
  (local $1 i32)
  i32.const 0
  i32.const 512
  i32.const 512
  call $~lib/arraybuffer/ArrayBuffer#constructor
  local.tee $1
  call $~lib/@btc-vision/btc-runtime/runtime/env/global/getEnvironmentVariables
  i32.const 1
  global.set $~argumentsLength
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.get $1
  call $~lib/typedarray/Uint8Array.wrap@varargs
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#setEnvironmentVariables
  i32.const 0
  local.get $0
  local.get $0
  call $~lib/arraybuffer/ArrayBuffer#constructor
  local.tee $0
  call $~lib/@btc-vision/btc-runtime/runtime/env/global/getCalldata
  i32.const 1
  global.set $~argumentsLength
  local.get $0
  call $~lib/typedarray/Uint8Array.wrap@varargs
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#constructor
  drop
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  i32.const 0
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#onExecutionStarted
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#get:contract
  call $~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#onExecutionStarted
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  i32.const 0
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#onExecutionCompleted
  i32.const 0
 )
 (func $~lib/array/Array<~lib/typedarray/Uint8Array>#__uget (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  i32.load offset=4
  local.get $1
  i32.const 2
  i32.shl
  i32.add
  i32.load
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/generic/MapUint8Array/MapUint8Array#isLastIndex (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $0
  i32.load offset=8
  i32.const -1
  i32.ne
  if
   local.get $0
   i32.load
   local.get $0
   i32.load offset=8
   call $~lib/array/Array<~lib/typedarray/Uint8Array>#__uget
   local.tee $2
   i32.load offset=8
   local.get $1
   i32.load offset=8
   i32.eq
   if
    local.get $1
    i32.load offset=8
    local.set $0
    local.get $1
    i32.load offset=4
    local.set $3
    i32.const 0
    local.set $1
    block $~lib/util/memory/memcmp|inlined.0
     local.get $3
     local.get $2
     i32.load offset=4
     local.tee $2
     i32.eq
     br_if $~lib/util/memory/memcmp|inlined.0
     local.get $2
     i32.const 7
     i32.and
     local.get $3
     i32.const 7
     i32.and
     i32.eq
     if
      loop $while-continue|0
       local.get $2
       i32.const 7
       i32.and
       if
        i32.const 0
        local.set $1
        local.get $0
        i32.eqz
        br_if $~lib/util/memory/memcmp|inlined.0
        local.get $2
        i32.load8_u
        local.tee $4
        local.get $3
        i32.load8_u
        local.tee $5
        i32.sub
        local.set $1
        local.get $4
        local.get $5
        i32.ne
        br_if $~lib/util/memory/memcmp|inlined.0
        local.get $0
        i32.const 1
        i32.sub
        local.set $0
        local.get $2
        i32.const 1
        i32.add
        local.set $2
        local.get $3
        i32.const 1
        i32.add
        local.set $3
        br $while-continue|0
       end
      end
      loop $while-continue|1
       local.get $0
       i32.const 8
       i32.ge_u
       if
        local.get $2
        i64.load
        local.get $3
        i64.load
        i64.eq
        if
         local.get $2
         i32.const 8
         i32.add
         local.set $2
         local.get $3
         i32.const 8
         i32.add
         local.set $3
         local.get $0
         i32.const 8
         i32.sub
         local.set $0
         br $while-continue|1
        end
       end
      end
     end
     loop $while-continue|2
      local.get $0
      local.tee $1
      i32.const 1
      i32.sub
      local.set $0
      local.get $1
      if
       local.get $2
       i32.load8_u
       local.tee $4
       local.get $3
       i32.load8_u
       local.tee $5
       i32.sub
       local.set $1
       local.get $4
       local.get $5
       i32.ne
       br_if $~lib/util/memory/memcmp|inlined.0
       local.get $2
       i32.const 1
       i32.add
       local.set $2
       local.get $3
       i32.const 1
       i32.add
       local.set $3
       br $while-continue|2
      end
     end
     i32.const 0
     local.set $1
    end
    local.get $1
    i32.eqz
    if
     i32.const 1
     return
    end
   end
  end
  i32.const 0
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/generic/MapUint8Array/MapUint8Array#indexOf (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i64)
  local.get $0
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/generic/MapUint8Array/MapUint8Array#isLastIndex
  if
   local.get $0
   i32.load offset=8
   return
  end
  local.get $0
  i32.load
  i32.load offset=12
  local.tee $2
  i32.eqz
  if
   i32.const -1
   return
  end
  local.get $1
  i32.load offset=4
  local.set $4
  local.get $1
  i32.load offset=8
  local.tee $3
  i32.const 8
  i32.ge_s
  if
   local.get $4
   i64.load
   local.set $10
   local.get $2
   i32.const 1
   i32.sub
   local.set $9
   loop $for-loop|0
    local.get $9
    i32.const 0
    i32.ge_s
    if
     block $for-continue|0
      local.get $0
      i32.load
      local.get $9
      call $~lib/array/Array<~lib/typedarray/Uint8Array>#__uget
      local.tee $2
      i32.load offset=8
      local.get $3
      i32.ne
      br_if $for-continue|0
      local.get $2
      i32.load offset=4
      i64.load
      local.get $10
      i64.ne
      br_if $for-continue|0
      local.get $3
      local.set $1
      i32.const 0
      local.set $8
      block $~lib/util/memory/memcmp|inlined.1
       local.get $2
       i32.load offset=4
       local.tee $7
       local.get $4
       local.tee $2
       i32.eq
       br_if $~lib/util/memory/memcmp|inlined.1
       local.get $7
       i32.const 7
       i32.and
       local.get $2
       i32.const 7
       i32.and
       i32.eq
       if
        loop $while-continue|1
         local.get $7
         i32.const 7
         i32.and
         if
          i32.const 0
          local.set $8
          local.get $1
          i32.eqz
          br_if $~lib/util/memory/memcmp|inlined.1
          local.get $7
          i32.load8_u
          local.tee $6
          local.get $2
          i32.load8_u
          local.tee $5
          i32.sub
          local.set $8
          local.get $5
          local.get $6
          i32.ne
          br_if $~lib/util/memory/memcmp|inlined.1
          local.get $1
          i32.const 1
          i32.sub
          local.set $1
          local.get $7
          i32.const 1
          i32.add
          local.set $7
          local.get $2
          i32.const 1
          i32.add
          local.set $2
          br $while-continue|1
         end
        end
        loop $while-continue|2
         local.get $1
         i32.const 8
         i32.ge_u
         if
          local.get $7
          i64.load
          local.get $2
          i64.load
          i64.eq
          if
           local.get $7
           i32.const 8
           i32.add
           local.set $7
           local.get $2
           i32.const 8
           i32.add
           local.set $2
           local.get $1
           i32.const 8
           i32.sub
           local.set $1
           br $while-continue|2
          end
         end
        end
       end
       loop $while-continue|3
        local.get $1
        local.tee $5
        i32.const 1
        i32.sub
        local.set $1
        local.get $5
        if
         local.get $7
         i32.load8_u
         local.tee $6
         local.get $2
         i32.load8_u
         local.tee $5
         i32.sub
         local.set $8
         local.get $5
         local.get $6
         i32.ne
         br_if $~lib/util/memory/memcmp|inlined.1
         local.get $7
         i32.const 1
         i32.add
         local.set $7
         local.get $2
         i32.const 1
         i32.add
         local.set $2
         br $while-continue|3
        end
       end
       i32.const 0
       local.set $8
      end
      local.get $8
      i32.eqz
      if
       local.get $0
       local.get $9
       i32.store offset=8
       local.get $9
       return
      end
     end
     local.get $9
     i32.const 1
     i32.sub
     local.set $9
     br $for-loop|0
    end
   end
  else
   local.get $2
   i32.const 1
   i32.sub
   local.set $9
   loop $for-loop|4
    local.get $9
    i32.const 0
    i32.ge_s
    if
     local.get $3
     local.get $0
     i32.load
     local.get $9
     call $~lib/array/Array<~lib/typedarray/Uint8Array>#__uget
     local.tee $2
     i32.load offset=8
     i32.eq
     if
      local.get $3
      local.set $1
      i32.const 0
      local.set $8
      block $~lib/util/memory/memcmp|inlined.2
       local.get $2
       i32.load offset=4
       local.tee $7
       local.get $4
       local.tee $2
       i32.eq
       br_if $~lib/util/memory/memcmp|inlined.2
       local.get $7
       i32.const 7
       i32.and
       local.get $2
       i32.const 7
       i32.and
       i32.eq
       if
        loop $while-continue|5
         local.get $7
         i32.const 7
         i32.and
         if
          i32.const 0
          local.set $8
          local.get $1
          i32.eqz
          br_if $~lib/util/memory/memcmp|inlined.2
          local.get $7
          i32.load8_u
          local.tee $6
          local.get $2
          i32.load8_u
          local.tee $5
          i32.sub
          local.set $8
          local.get $5
          local.get $6
          i32.ne
          br_if $~lib/util/memory/memcmp|inlined.2
          local.get $1
          i32.const 1
          i32.sub
          local.set $1
          local.get $7
          i32.const 1
          i32.add
          local.set $7
          local.get $2
          i32.const 1
          i32.add
          local.set $2
          br $while-continue|5
         end
        end
        loop $while-continue|6
         local.get $1
         i32.const 8
         i32.ge_u
         if
          local.get $7
          i64.load
          local.get $2
          i64.load
          i64.eq
          if
           local.get $7
           i32.const 8
           i32.add
           local.set $7
           local.get $2
           i32.const 8
           i32.add
           local.set $2
           local.get $1
           i32.const 8
           i32.sub
           local.set $1
           br $while-continue|6
          end
         end
        end
       end
       loop $while-continue|7
        local.get $1
        local.tee $5
        i32.const 1
        i32.sub
        local.set $1
        local.get $5
        if
         local.get $7
         i32.load8_u
         local.tee $6
         local.get $2
         i32.load8_u
         local.tee $5
         i32.sub
         local.set $8
         local.get $5
         local.get $6
         i32.ne
         br_if $~lib/util/memory/memcmp|inlined.2
         local.get $7
         i32.const 1
         i32.add
         local.set $7
         local.get $2
         i32.const 1
         i32.add
         local.set $2
         br $while-continue|7
        end
       end
       i32.const 0
       local.set $8
      end
      local.get $8
      i32.eqz
      if
       local.get $0
       local.get $9
       i32.store offset=8
       local.get $9
       return
      end
     end
     local.get $9
     i32.const 1
     i32.sub
     local.set $9
     br $for-loop|4
    end
   end
  end
  i32.const -1
 )
 (func $~lib/array/Array<~lib/typedarray/Uint8Array>#push (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  local.get $0
  i32.load offset=12
  local.tee $2
  i32.const 1
  i32.add
  local.tee $3
  i32.const 2
  call $~lib/array/ensureCapacity
  local.get $0
  i32.load offset=4
  local.get $2
  i32.const 2
  i32.shl
  i32.add
  local.get $1
  i32.store
  local.get $0
  local.get $3
  i32.store offset=12
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/generic/MapUint8Array/MapUint8Array#set (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $0
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/generic/MapUint8Array/MapUint8Array#indexOf
  local.tee $3
  i32.const -1
  i32.eq
  if
   local.get $0
   i32.load
   local.get $1
   call $~lib/array/Array<~lib/typedarray/Uint8Array>#push
   local.get $0
   i32.load offset=4
   local.get $2
   call $~lib/array/Array<~lib/typedarray/Uint8Array>#push
   local.get $0
   local.get $0
   i32.load
   i32.load offset=12
   i32.const 1
   i32.sub
   i32.store offset=8
  else
   local.get $3
   local.get $0
   i32.load offset=4
   local.tee $1
   i32.load offset=12
   i32.ge_u
   if
    local.get $3
    i32.const 0
    i32.lt_s
    if
     unreachable
    end
    local.get $1
    local.get $3
    i32.const 1
    i32.add
    local.tee $4
    i32.const 2
    call $~lib/array/ensureCapacity
    local.get $1
    local.get $4
    i32.store offset=12
   end
   local.get $1
   i32.load offset=4
   local.get $3
   i32.const 2
   i32.shl
   i32.add
   local.get $2
   i32.store
   local.get $0
   local.get $3
   i32.store offset=8
  end
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#hasPointerStorageHash (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $1
  i32.load
  i32.const 20
  i32.sub
  i32.load offset=16
  i32.const 32
  i32.ne
  if
   unreachable
  end
  local.get $0
  i32.load offset=4
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/generic/MapUint8Array/MapUint8Array#indexOf
  i32.const -1
  i32.ne
  if
   return
  end
  i32.const 32
  call $~lib/arraybuffer/ArrayBuffer#constructor
  local.set $2
  local.get $1
  i32.load
  local.get $2
  call $~lib/@btc-vision/btc-runtime/runtime/env/global/loadPointer
  i32.const 1
  global.set $~argumentsLength
  local.get $2
  call $~lib/typedarray/Uint8Array.wrap@varargs
  local.set $2
  local.get $0
  i32.load offset=4
  local.get $1
  local.get $2
  call $~lib/@btc-vision/btc-runtime/runtime/generic/MapUint8Array/MapUint8Array#set
  local.get $2
  i32.load offset=8
  global.get $~lib/@btc-vision/btc-runtime/runtime/math/bytes/EMPTY_BUFFER
  local.tee $1
  i32.load offset=8
  i32.eq
  if
   local.get $2
   i32.load offset=8
   local.set $0
   block $~lib/util/memory/memcmp|inlined.3
    local.get $2
    i32.load offset=4
    local.tee $2
    local.get $1
    i32.load offset=4
    local.tee $3
    i32.eq
    br_if $~lib/util/memory/memcmp|inlined.3
    local.get $2
    i32.const 7
    i32.and
    local.get $3
    i32.const 7
    i32.and
    i32.eq
    if
     loop $while-continue|0
      local.get $2
      i32.const 7
      i32.and
      if
       local.get $0
       i32.eqz
       br_if $~lib/util/memory/memcmp|inlined.3
       local.get $3
       i32.load8_u
       local.get $2
       i32.load8_u
       i32.ne
       br_if $~lib/util/memory/memcmp|inlined.3
       local.get $0
       i32.const 1
       i32.sub
       local.set $0
       local.get $2
       i32.const 1
       i32.add
       local.set $2
       local.get $3
       i32.const 1
       i32.add
       local.set $3
       br $while-continue|0
      end
     end
     loop $while-continue|1
      local.get $0
      i32.const 8
      i32.ge_u
      if
       local.get $2
       i64.load
       local.get $3
       i64.load
       i64.eq
       if
        local.get $2
        i32.const 8
        i32.add
        local.set $2
        local.get $3
        i32.const 8
        i32.add
        local.set $3
        local.get $0
        i32.const 8
        i32.sub
        local.set $0
        br $while-continue|1
       end
      end
     end
    end
    loop $while-continue|2
     local.get $0
     local.tee $1
     i32.const 1
     i32.sub
     local.set $0
     local.get $1
     if
      local.get $3
      i32.load8_u
      local.get $2
      i32.load8_u
      i32.ne
      br_if $~lib/util/memory/memcmp|inlined.3
      local.get $2
      i32.const 1
      i32.add
      local.set $2
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $while-continue|2
     end
    end
   end
  end
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#getStorageAt (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#hasPointerStorageHash
  local.get $0
  i32.load offset=4
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/generic/MapUint8Array/MapUint8Array#indexOf
  i32.const -1
  i32.ne
  if
   local.get $0
   i32.load offset=4
   local.tee $0
   local.get $1
   call $~lib/@btc-vision/btc-runtime/runtime/generic/MapUint8Array/MapUint8Array#indexOf
   local.tee $1
   i32.const -1
   i32.eq
   if
    unreachable
   end
   local.get $0
   i32.load offset=4
   local.get $1
   call $~lib/array/Array<~lib/typedarray/Uint8Array>#__uget
   return
  end
  i32.const 0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#_internalSetStorageAt (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  local.get $1
  i32.load offset=8
  i32.const 32
  i32.ne
  if
   unreachable
  end
  local.get $2
  local.set $3
  local.get $2
  i32.load offset=8
  i32.const 32
  i32.ne
  if
   i32.const 0
   i32.const 32
   call $~lib/typedarray/Uint8Array#constructor
   local.tee $3
   i32.load offset=4
   local.get $2
   i32.load offset=4
   local.get $2
   i32.load offset=8
   i32.const 32
   i32.lt_s
   if (result i32)
    local.get $2
    i32.load offset=8
   else
    i32.const 32
   end
   memory.copy
  end
  local.get $0
  i32.load offset=4
  local.get $1
  local.get $3
  call $~lib/@btc-vision/btc-runtime/runtime/generic/MapUint8Array/MapUint8Array#set
  local.get $1
  i32.load
  local.get $3
  i32.load
  call $~lib/@btc-vision/btc-runtime/runtime/env/global/storePointer
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/storage/StoredBoolean/StoredBoolean#set:value (param $0 i32) (param $1 i32)
  local.get $0
  i32.load offset=8
  i32.const 0
  local.get $1
  i32.eqz
  i32.eqz
  call $~lib/typedarray/Uint8Array#__set
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.get $0
  i32.load
  local.get $0
  i32.load offset=8
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#_internalSetStorageAt
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#get:value (param $0 i32) (result i32)
  (local $1 i32)
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.get $0
  i32.load
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#getStorageAt
  local.tee $1
  i32.load offset=8
  i32.const 32
  i32.ne
  if
   unreachable
  end
  local.get $0
  local.get $1
  i32.load offset=4
  local.tee $1
  i64.load offset=24
  call $~lib/polyfills/bswap<u64>
  local.get $1
  i64.load offset=16
  call $~lib/polyfills/bswap<u64>
  local.get $1
  i64.load offset=8
  call $~lib/polyfills/bswap<u64>
  local.get $1
  i64.load
  call $~lib/polyfills/bswap<u64>
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  i32.store offset=12
  local.get $0
  i32.load offset=12
 )
 (func $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.lt (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  i64.load offset=24
  local.get $1
  i64.load offset=24
  i64.ne
  if
   local.get $0
   i64.load offset=24
   local.get $1
   i64.load offset=24
   i64.lt_u
   return
  end
  local.get $0
  i64.load offset=16
  local.get $1
  i64.load offset=16
  i64.ne
  if
   local.get $0
   i64.load offset=16
   local.get $1
   i64.load offset=16
   i64.lt_u
   return
  end
  local.get $0
  i64.load offset=8
  local.get $1
  i64.load offset=8
  i64.ne
  if
   local.get $0
   i64.load offset=8
   local.get $1
   i64.load offset=8
   i64.lt_u
   return
  end
  local.get $0
  i64.load
  local.get $1
  i64.load
  i64.lt_u
 )
 (func $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.add (param $0 i32) (param $1 i32) (result i32)
  (local $2 i64)
  (local $3 i64)
  (local $4 i64)
  (local $5 i64)
  (local $6 i64)
  (local $7 i64)
  local.get $0
  i64.load
  local.tee $3
  local.get $1
  i64.load
  i64.add
  local.set $2
  local.get $2
  local.get $3
  i64.lt_u
  i64.extend_i32_s
  global.set $~lib/@btc-vision/as-bignum/assembly/globals/__u256carry
  local.get $0
  i64.load offset=8
  local.tee $3
  global.get $~lib/@btc-vision/as-bignum/assembly/globals/__u256carry
  i64.add
  local.tee $4
  local.get $1
  i64.load offset=8
  i64.add
  local.set $5
  local.get $3
  local.get $4
  i64.gt_u
  local.get $4
  local.get $5
  i64.gt_u
  i32.add
  i64.extend_i32_s
  global.set $~lib/@btc-vision/as-bignum/assembly/globals/__u256carry
  local.get $0
  i64.load offset=16
  local.tee $3
  global.get $~lib/@btc-vision/as-bignum/assembly/globals/__u256carry
  i64.add
  local.tee $4
  local.get $1
  i64.load offset=16
  i64.add
  local.set $6
  local.get $3
  local.get $4
  i64.gt_u
  local.get $4
  local.get $6
  i64.gt_u
  i32.add
  i64.extend_i32_s
  global.set $~lib/@btc-vision/as-bignum/assembly/globals/__u256carry
  local.get $0
  i64.load offset=24
  local.tee $4
  global.get $~lib/@btc-vision/as-bignum/assembly/globals/__u256carry
  i64.add
  local.tee $3
  local.get $1
  i64.load offset=24
  i64.add
  local.set $7
  local.get $3
  local.get $4
  i64.lt_u
  local.get $3
  local.get $7
  i64.gt_u
  i32.add
  i64.extend_i32_s
  global.set $~lib/@btc-vision/as-bignum/assembly/globals/__u256carry
  local.get $2
  local.get $5
  local.get $6
  local.get $7
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.add (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.add
  local.tee $1
  local.get $0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.lt
  if
   unreachable
  end
  local.get $1
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#get:__value (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  i32.load offset=12
  local.set $1
  i32.const 0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
  local.tee $0
  i32.load offset=4
  local.tee $2
  local.get $1
  i64.load offset=24
  call $~lib/polyfills/bswap<u64>
  i64.store
  local.get $2
  local.get $1
  i64.load offset=16
  call $~lib/polyfills/bswap<u64>
  i64.store offset=8
  local.get $2
  local.get $1
  i64.load offset=8
  call $~lib/polyfills/bswap<u64>
  i64.store offset=16
  local.get $2
  local.get $1
  i64.load
  call $~lib/polyfills/bswap<u64>
  i64.store offset=24
  local.get $0
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#set:value (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store offset=12
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.get $0
  i32.load
  local.get $0
  call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#get:__value
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#_internalSetStorageAt
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU256 (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  local.get $0
  i32.load offset=4
  i32.const 32
  i32.add
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#verifyEnd
  i32.const 32
  call $~lib/array/Array<u8>#constructor
  local.set $1
  loop $for-loop|0
   local.get $2
   i32.const 32
   i32.lt_s
   if
    local.get $1
    local.get $2
    local.get $0
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU8
    call $~lib/array/Array<u8>#__set
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $1
  i32.load offset=12
  i32.const 32
  i32.ne
  if
   unreachable
  end
  local.get $1
  i32.load offset=4
  local.tee $0
  i64.load offset=24
  call $~lib/polyfills/bswap<u64>
  local.get $0
  i64.load offset=16
  call $~lib/polyfills/bswap<u64>
  local.get $0
  i64.load offset=8
  call $~lib/polyfills/bswap<u64>
  local.get $0
  i64.load
  call $~lib/polyfills/bswap<u64>
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
 )
 (func $~lib/string/String.UTF8.decodeUnsafe (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  local.get $0
  local.get $1
  i32.add
  local.tee $3
  local.get $0
  i32.lt_u
  if
   unreachable
  end
  local.get $1
  i32.const 1
  i32.shl
  i32.const 2
  call $~lib/rt/stub/__new
  local.tee $4
  local.set $1
  loop $while-continue|0
   local.get $0
   local.get $3
   i32.lt_u
   if
    block $while-break|0
     local.get $0
     i32.load8_u
     local.set $5
     local.get $0
     i32.const 1
     i32.add
     local.set $0
     local.get $5
     i32.const 128
     i32.and
     if
      local.get $0
      local.get $3
      i32.eq
      br_if $while-break|0
      local.get $0
      i32.load8_u
      i32.const 63
      i32.and
      local.set $6
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      local.get $5
      i32.const 224
      i32.and
      i32.const 192
      i32.eq
      if
       local.get $1
       local.get $5
       i32.const 31
       i32.and
       i32.const 6
       i32.shl
       local.get $6
       i32.or
       i32.store16
      else
       local.get $0
       local.get $3
       i32.eq
       br_if $while-break|0
       local.get $0
       i32.load8_u
       i32.const 63
       i32.and
       local.set $2
       local.get $0
       i32.const 1
       i32.add
       local.set $0
       local.get $5
       i32.const 240
       i32.and
       i32.const 224
       i32.eq
       if
        local.get $5
        i32.const 15
        i32.and
        i32.const 12
        i32.shl
        local.get $6
        i32.const 6
        i32.shl
        i32.or
        local.get $2
        i32.or
        local.set $2
       else
        local.get $0
        local.get $3
        i32.eq
        br_if $while-break|0
        local.get $0
        i32.load8_u
        i32.const 63
        i32.and
        local.get $5
        i32.const 7
        i32.and
        i32.const 18
        i32.shl
        local.get $6
        i32.const 12
        i32.shl
        i32.or
        local.get $2
        i32.const 6
        i32.shl
        i32.or
        i32.or
        local.set $2
        local.get $0
        i32.const 1
        i32.add
        local.set $0
       end
       local.get $2
       i32.const 65536
       i32.lt_u
       if
        local.get $1
        local.get $2
        i32.store16
       else
        local.get $1
        local.get $2
        i32.const 65536
        i32.sub
        local.tee $2
        i32.const 10
        i32.shr_u
        i32.const 55296
        i32.or
        local.get $2
        i32.const 1023
        i32.and
        i32.const 56320
        i32.or
        i32.const 16
        i32.shl
        i32.or
        i32.store
        local.get $1
        i32.const 2
        i32.add
        local.set $1
       end
      end
     else
      local.get $1
      local.get $5
      i32.store16
     end
     local.get $1
     i32.const 2
     i32.add
     local.set $1
     br $while-continue|0
    end
   end
  end
  local.get $4
  local.get $1
  local.get $4
  i32.sub
  call $~lib/rt/stub/__renew
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readStringWithLength (param $0 i32) (result i32)
  local.get $0
  local.get $0
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU32
  i32.const 1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readBytes
  i32.load
  local.tee $0
  local.get $0
  i32.const 20
  i32.sub
  i32.load offset=16
  call $~lib/string/String.UTF8.decodeUnsafe
 )
 (func $~lib/polyfills/bswap<u16> (param $0 i32) (result i32)
  local.get $0
  i32.const 8
  i32.shl
  local.get $0
  i32.const 65535
  i32.and
  i32.const 8
  i32.shr_u
  i32.or
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU16 (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  local.get $0
  local.get $0
  i32.load offset=4
  i32.const 2
  i32.add
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#verifyEnd
  local.get $0
  i32.load offset=4
  local.tee $1
  i32.const 31
  i32.shr_u
  local.get $0
  i32.load
  local.tee $2
  i32.load offset=8
  local.get $1
  i32.const 2
  i32.add
  i32.lt_s
  i32.or
  if
   unreachable
  end
  local.get $1
  local.get $2
  i32.load offset=4
  i32.add
  i32.load16_u
  call $~lib/polyfills/bswap<u16>
  local.get $0
  local.get $0
  i32.load offset=4
  i32.const 2
  i32.add
  i32.store offset=4
 )
 (func $src/BlockBillContract/BlockBillContract#buildKey (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  i32.const 0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
  local.tee $4
  i32.load offset=4
  local.tee $3
  local.get $1
  i64.load offset=24
  call $~lib/polyfills/bswap<u64>
  i64.store
  local.get $3
  local.get $1
  i64.load offset=16
  call $~lib/polyfills/bswap<u64>
  i64.store offset=8
  local.get $3
  local.get $1
  i64.load offset=8
  call $~lib/polyfills/bswap<u64>
  i64.store offset=16
  local.get $3
  local.get $1
  i64.load
  call $~lib/polyfills/bswap<u64>
  i64.store offset=24
  i32.const 0
  i32.const 30
  call $~lib/typedarray/Uint8Array#constructor
  local.set $1
  loop $for-loop|0
   local.get $2
   i32.const 30
   i32.lt_s
   if
    local.get $1
    local.get $2
    local.get $4
    local.get $2
    i32.const 2
    i32.add
    call $~lib/typedarray/Uint8Array#__get
    call $~lib/typedarray/Uint8Array#__set
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $0
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/math/abi/encodePointer
 )
 (func $src/BlockBillContract/BlockBillContract#storeAddressAt (param $0 i32) (param $1 i32) (param $2 i32)
  local.get $0
  local.get $1
  call $src/BlockBillContract/BlockBillContract#buildKey
  local.set $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.get $0
  local.get $2
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#_internalSetStorageAt
 )
 (func $src/BlockBillContract/BlockBillContract#storeU256At (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $0
  local.get $1
  call $src/BlockBillContract/BlockBillContract#buildKey
  local.set $3
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  i32.const 0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
  local.tee $0
  i32.load offset=4
  local.tee $1
  local.get $2
  i64.load offset=24
  call $~lib/polyfills/bswap<u64>
  i64.store
  local.get $1
  local.get $2
  i64.load offset=16
  call $~lib/polyfills/bswap<u64>
  i64.store offset=8
  local.get $1
  local.get $2
  i64.load offset=8
  call $~lib/polyfills/bswap<u64>
  i64.store offset=16
  local.get $1
  local.get $2
  i64.load
  call $~lib/polyfills/bswap<u64>
  i64.store offset=24
  local.get $3
  local.get $0
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#_internalSetStorageAt
 )
 (func $~lib/array/Array<u64>#__set (param $0 i32) (param $1 i32) (param $2 i64)
  (local $3 i32)
  local.get $1
  local.get $0
  i32.load offset=12
  i32.ge_u
  if
   local.get $1
   i32.const 0
   i32.lt_s
   if
    unreachable
   end
   local.get $0
   local.get $1
   i32.const 1
   i32.add
   local.tee $3
   i32.const 3
   call $~lib/array/ensureCapacity
   local.get $0
   local.get $3
   i32.store offset=12
  end
  local.get $0
  i32.load offset=4
  local.get $1
  i32.const 3
  i32.shl
  i32.add
  local.get $2
  i64.store
 )
 (func $~lib/array/Array<u64>#__get (param $0 i32) (param $1 i32) (result i64)
  local.get $1
  local.get $0
  i32.load offset=12
  i32.ge_u
  if
   unreachable
  end
  local.get $0
  i32.load offset=4
  local.get $1
  i32.const 3
  i32.shl
  i32.add
  i64.load
 )
 (func $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#clone (param $0 i32) (result i32)
  local.get $0
  i64.load
  local.get $0
  i64.load offset=8
  local.get $0
  i64.load offset=16
  local.get $0
  i64.load offset=24
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
 )
 (func $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.shl (param $0 i32) (param $1 i32) (result i32)
  (local $2 i64)
  (local $3 i64)
  (local $4 i64)
  (local $5 i64)
  (local $6 i64)
  (local $7 i32)
  (local $8 i64)
  (local $9 i32)
  (local $10 i64)
  local.get $1
  i32.const 0
  i32.le_s
  if
   local.get $1
   if (result i32)
    i64.const 0
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
   else
    local.get $0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#clone
   end
   return
  end
  local.get $1
  i32.const 256
  i32.ge_s
  if
   i64.const 0
   i64.const 0
   i64.const 0
   i64.const 0
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
   return
  end
  local.get $1
  i32.const 255
  i32.and
  local.tee $7
  i32.const 6
  i32.shr_u
  local.set $1
  i32.const 64
  local.get $7
  i32.const 63
  i32.and
  local.tee $7
  i32.sub
  local.set $9
  local.get $0
  i64.load
  local.set $8
  local.get $0
  i64.load offset=8
  local.set $10
  local.get $0
  i64.load offset=16
  local.set $2
  local.get $0
  i64.load offset=24
  local.set $5
  local.get $1
  if (result i64)
   local.get $1
   i32.const 1
   i32.eq
   if (result i64)
    local.get $8
    local.get $7
    i64.extend_i32_s
    i64.shl
    local.set $4
    local.get $10
    local.get $7
    i64.extend_i32_s
    i64.shl
    local.get $8
    local.get $9
    i64.extend_i32_s
    i64.shr_u
    i64.const 0
    local.get $7
    select
    i64.or
    local.set $3
    local.get $2
    local.get $7
    i64.extend_i32_s
    i64.shl
    local.get $10
    local.get $9
    i64.extend_i32_s
    i64.shr_u
    i64.const 0
    local.get $7
    select
    i64.or
   else
    local.get $1
    i32.const 2
    i32.eq
    if (result i64)
     local.get $8
     local.get $7
     i64.extend_i32_s
     i64.shl
     local.set $3
     local.get $10
     local.get $7
     i64.extend_i32_s
     i64.shl
     local.get $8
     local.get $9
     i64.extend_i32_s
     i64.shr_u
     i64.const 0
     local.get $7
     select
     i64.or
    else
     local.get $8
     local.get $7
     i64.extend_i32_s
     i64.shl
     i64.const 0
     local.get $1
     i32.const 3
     i32.eq
     select
    end
   end
  else
   local.get $8
   local.get $7
   i64.extend_i32_s
   i64.shl
   local.set $6
   local.get $10
   local.get $7
   i64.extend_i32_s
   i64.shl
   local.get $8
   local.get $9
   i64.extend_i32_s
   i64.shr_u
   i64.const 0
   local.get $7
   select
   i64.or
   local.set $4
   local.get $2
   local.get $7
   i64.extend_i32_s
   i64.shl
   local.get $10
   local.get $9
   i64.extend_i32_s
   i64.shr_u
   i64.const 0
   local.get $7
   select
   i64.or
   local.set $3
   local.get $5
   local.get $7
   i64.extend_i32_s
   i64.shl
   local.get $2
   local.get $9
   i64.extend_i32_s
   i64.shr_u
   i64.const 0
   local.get $7
   select
   i64.or
  end
  local.set $2
  local.get $6
  local.get $4
  local.get $3
  local.get $2
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
 )
 (func $~lib/@btc-vision/as-bignum/assembly/globals/__mul256 (param $0 i64) (param $1 i64) (param $2 i64) (param $3 i64) (param $4 i64) (param $5 i64) (param $6 i64) (param $7 i64) (result i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  i64.const 0
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  local.set $8
  i32.const 4
  i32.const 3
  i32.const 42
  i32.const 0
  call $~lib/rt/__newArray
  local.tee $10
  i32.const 0
  local.get $0
  call $~lib/array/Array<u64>#__set
  local.get $10
  i32.const 1
  local.get $1
  call $~lib/array/Array<u64>#__set
  local.get $10
  i32.const 2
  local.get $2
  call $~lib/array/Array<u64>#__set
  local.get $10
  i32.const 3
  local.get $3
  call $~lib/array/Array<u64>#__set
  i32.const 4
  i32.const 3
  i32.const 42
  i32.const 0
  call $~lib/rt/__newArray
  local.tee $11
  i32.const 0
  local.get $4
  call $~lib/array/Array<u64>#__set
  local.get $11
  i32.const 1
  local.get $5
  call $~lib/array/Array<u64>#__set
  local.get $11
  i32.const 2
  local.get $6
  call $~lib/array/Array<u64>#__set
  local.get $11
  i32.const 3
  local.get $7
  call $~lib/array/Array<u64>#__set
  loop $for-loop|0
   local.get $12
   i32.const 4
   i32.lt_s
   if
    i32.const 0
    local.set $9
    loop $for-loop|1
     local.get $9
     i32.const 4
     i32.lt_s
     if
      local.get $9
      local.get $12
      i32.add
      i32.const 6
      i32.shl
      local.tee $13
      i32.const 256
      i32.lt_s
      if
       local.get $10
       local.get $12
       call $~lib/array/Array<u64>#__get
       local.tee $0
       i64.const 32
       i64.shr_u
       local.set $1
       local.get $11
       local.get $9
       call $~lib/array/Array<u64>#__get
       local.tee $2
       i64.const 4294967295
       i64.and
       local.tee $3
       local.get $0
       i64.const 4294967295
       i64.and
       local.tee $0
       i64.mul
       local.set $4
       local.get $2
       i64.const 32
       i64.shr_u
       local.tee $2
       local.get $0
       i64.mul
       local.get $1
       local.get $3
       i64.mul
       local.get $4
       i64.const 32
       i64.shr_u
       i64.add
       local.tee $0
       i64.const 4294967295
       i64.and
       i64.add
       local.set $3
       local.get $1
       local.get $2
       i64.mul
       local.get $0
       i64.const 32
       i64.shr_u
       i64.add
       local.get $3
       i64.const 32
       i64.shr_u
       i64.add
       global.set $~lib/@btc-vision/as-bignum/assembly/globals/__res128_hi
       local.get $4
       i64.const 4294967295
       i64.and
       local.get $3
       i64.const 32
       i64.shl
       i64.or
       global.get $~lib/@btc-vision/as-bignum/assembly/globals/__res128_hi
       call $~lib/@btc-vision/as-bignum/assembly/integer/u128/u128#constructor
       local.tee $14
       i64.load
       local.get $14
       i64.load offset=8
       i64.const 0
       i64.const 0
       call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
       local.set $14
       local.get $8
       local.get $13
       if (result i32)
        local.get $14
        local.get $13
        call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.shl
       else
        local.get $14
       end
       call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.add
       local.set $8
      end
      local.get $9
      i32.const 1
      i32.add
      local.set $9
      br $for-loop|1
     end
    end
    local.get $12
    i32.const 1
    i32.add
    local.set $12
    br $for-loop|0
   end
  end
  local.get $8
 )
 (func $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.div (param $0 i32) (param $1 i32) (result i32)
  (local $2 i64)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i64)
  (local $7 i64)
  (local $8 i64)
  (local $9 i64)
  (local $10 i64)
  local.get $1
  i64.load offset=24
  local.get $1
  i64.load offset=16
  local.get $1
  i64.load
  local.get $1
  i64.load offset=8
  i64.or
  i64.or
  i64.or
  i64.eqz
  if
   unreachable
  end
  local.get $0
  i64.load offset=24
  local.get $0
  i64.load offset=16
  local.get $0
  i64.load
  local.get $0
  i64.load offset=8
  i64.or
  i64.or
  i64.or
  i64.eqz
  if (result i32)
   i32.const 1
  else
   local.get $0
   local.get $1
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.lt
  end
  if
   i64.const 0
   i64.const 0
   i64.const 0
   i64.const 0
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
   return
  end
  local.get $0
  i64.load
  local.get $1
  i64.load
  i64.eq
  if (result i32)
   local.get $0
   i64.load offset=8
   local.get $1
   i64.load offset=8
   i64.eq
  else
   i32.const 0
  end
  if (result i32)
   local.get $0
   i64.load offset=16
   local.get $1
   i64.load offset=16
   i64.eq
  else
   i32.const 0
  end
  if (result i32)
   local.get $0
   i64.load offset=24
   local.get $1
   i64.load offset=24
   i64.eq
  else
   i32.const 0
  end
  if
   i64.const 1
   i64.const 0
   i64.const 0
   i64.const 0
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
   return
  end
  local.get $0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#clone
  local.set $5
  local.get $1
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#clone
  local.set $1
  i64.const 0
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#clone
  local.set $0
  local.get $1
  block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.clz|inlined.0 (result i32)
   local.get $1
   i64.load offset=24
   i64.const 0
   i64.ne
   if
    local.get $1
    i64.load offset=24
    i64.clz
    i32.wrap_i64
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.clz|inlined.0
   end
   local.get $1
   i64.load offset=16
   i64.const 0
   i64.ne
   if
    local.get $1
    i64.load offset=16
    i64.clz
    i64.const -64
    i64.sub
    i32.wrap_i64
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.clz|inlined.0
   end
   local.get $1
   i64.load offset=8
   i64.const 0
   i64.ne
   if
    local.get $1
    i64.load offset=8
    i64.clz
    i64.const 128
    i64.add
    i32.wrap_i64
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.clz|inlined.0
   end
   local.get $1
   i64.load
   i64.const 0
   i64.ne
   if
    local.get $1
    i64.load
    i64.clz
    i64.const 192
    i64.add
    i32.wrap_i64
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.clz|inlined.0
   end
   i32.const 256
  end
  block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.clz|inlined.1 (result i32)
   local.get $5
   i64.load offset=24
   i64.const 0
   i64.ne
   if
    local.get $5
    i64.load offset=24
    i64.clz
    i32.wrap_i64
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.clz|inlined.1
   end
   local.get $5
   i64.load offset=16
   i64.const 0
   i64.ne
   if
    local.get $5
    i64.load offset=16
    i64.clz
    i64.const -64
    i64.sub
    i32.wrap_i64
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.clz|inlined.1
   end
   local.get $5
   i64.load offset=8
   i64.const 0
   i64.ne
   if
    local.get $5
    i64.load offset=8
    i64.clz
    i64.const 128
    i64.add
    i32.wrap_i64
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.clz|inlined.1
   end
   local.get $5
   i64.load
   i64.const 0
   i64.ne
   if
    local.get $5
    i64.load
    i64.clz
    i64.const 192
    i64.add
    i32.wrap_i64
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.clz|inlined.1
   end
   i32.const 256
  end
  i32.sub
  local.tee $1
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.shl
  local.set $4
  loop $for-loop|0
   local.get $1
   i32.const 0
   i32.ge_s
   if
    local.get $5
    local.get $4
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.lt
    i32.eqz
    if
     local.get $5
     i64.load
     local.tee $2
     local.get $4
     i64.load
     i64.sub
     local.set $6
     local.get $2
     local.get $6
     i64.lt_u
     i64.extend_i32_s
     global.set $~lib/@btc-vision/as-bignum/assembly/globals/__u256carrySub
     local.get $5
     i64.load offset=8
     local.tee $2
     local.get $4
     i64.load offset=8
     i64.sub
     local.tee $7
     global.get $~lib/@btc-vision/as-bignum/assembly/globals/__u256carrySub
     i64.sub
     local.set $8
     local.get $7
     local.get $8
     i64.lt_u
     local.get $2
     local.get $7
     i64.lt_u
     i32.add
     i64.extend_i32_s
     global.set $~lib/@btc-vision/as-bignum/assembly/globals/__u256carrySub
     local.get $5
     i64.load offset=16
     local.tee $2
     local.get $4
     i64.load offset=16
     i64.sub
     local.tee $7
     global.get $~lib/@btc-vision/as-bignum/assembly/globals/__u256carrySub
     i64.sub
     local.set $9
     local.get $7
     local.get $9
     i64.lt_u
     local.get $2
     local.get $7
     i64.lt_u
     i32.add
     i64.extend_i32_s
     global.set $~lib/@btc-vision/as-bignum/assembly/globals/__u256carrySub
     local.get $5
     i64.load offset=24
     local.tee $7
     local.get $4
     i64.load offset=24
     i64.sub
     local.tee $2
     global.get $~lib/@btc-vision/as-bignum/assembly/globals/__u256carrySub
     i64.sub
     local.set $10
     local.get $2
     local.get $10
     i64.lt_u
     local.get $2
     local.get $7
     i64.gt_u
     i32.add
     i64.extend_i32_s
     global.set $~lib/@btc-vision/as-bignum/assembly/globals/__u256carrySub
     local.get $5
     local.get $6
     i64.store
     local.get $5
     local.get $8
     i64.store offset=8
     local.get $5
     local.get $9
     i64.store offset=16
     local.get $5
     local.get $10
     i64.store offset=24
     i64.const 1
     local.get $1
     i32.const 64
     i32.rem_s
     i64.extend_i32_s
     i64.shl
     local.set $2
     local.get $1
     i32.const 64
     i32.div_s
     local.tee $3
     if
      local.get $3
      i32.const 1
      i32.eq
      if
       local.get $0
       local.get $0
       i64.load offset=8
       local.get $2
       i64.or
       i64.store offset=8
      else
       local.get $3
       i32.const 2
       i32.eq
       if
        local.get $0
        local.get $0
        i64.load offset=16
        local.get $2
        i64.or
        i64.store offset=16
       else
        local.get $3
        i32.const 3
        i32.eq
        if
         local.get $0
         local.get $0
         i64.load offset=24
         local.get $2
         i64.or
         i64.store offset=24
        end
       end
      end
     else
      local.get $0
      local.get $0
      i64.load
      local.get $2
      i64.or
      i64.store
     end
    end
    local.get $4
    local.get $4
    i64.load offset=8
    i64.const 63
    i64.shl
    local.get $4
    i64.load
    i64.const 1
    i64.shr_u
    i64.or
    i64.store
    local.get $4
    local.get $4
    i64.load offset=16
    i64.const 63
    i64.shl
    local.get $4
    i64.load offset=8
    i64.const 1
    i64.shr_u
    i64.or
    i64.store offset=8
    local.get $4
    local.get $4
    i64.load offset=24
    i64.const 63
    i64.shl
    local.get $4
    i64.load offset=16
    i64.const 1
    i64.shr_u
    i64.or
    i64.store offset=16
    local.get $4
    local.get $4
    i64.load offset=24
    i64.const 1
    i64.shr_u
    i64.store offset=24
    local.get $1
    i32.const 1
    i32.sub
    local.set $1
    br $for-loop|0
   end
  end
  local.get $0
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.mul (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  local.get $0
  i64.load offset=24
  local.get $0
  i64.load offset=16
  local.get $0
  i64.load
  local.get $0
  i64.load offset=8
  i64.or
  i64.or
  i64.or
  i64.eqz
  if (result i64)
   i64.const 0
  else
   local.get $1
   i64.load offset=24
   local.get $1
   i64.load offset=16
   local.get $1
   i64.load
   local.get $1
   i64.load offset=8
   i64.or
   i64.or
   i64.or
  end
  i64.eqz
  if
   i64.const 0
   i64.const 0
   i64.const 0
   i64.const 0
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
   return
  end
  local.get $0
  i64.load
  local.get $0
  i64.load offset=8
  local.get $0
  i64.load offset=16
  local.get $0
  i64.load offset=24
  local.get $1
  i64.load
  local.get $1
  i64.load offset=8
  local.get $1
  i64.load offset=16
  local.get $1
  i64.load offset=24
  call $~lib/@btc-vision/as-bignum/assembly/globals/__mul256
  local.tee $2
  local.get $0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.div
  local.tee $0
  i64.load
  local.get $1
  i64.load
  i64.eq
  if (result i32)
   local.get $0
   i64.load offset=8
   local.get $1
   i64.load offset=8
   i64.eq
  else
   i32.const 0
  end
  if (result i32)
   local.get $0
   i64.load offset=16
   local.get $1
   i64.load offset=16
   i64.eq
  else
   i32.const 0
  end
  if (result i32)
   local.get $0
   i64.load offset=24
   local.get $1
   i64.load offset=24
   i64.eq
  else
   i32.const 0
  end
  i32.eqz
  if
   unreachable
  end
  local.get $2
 )
 (func $src/BlockBillContract/BlockBillContract#storeLongString (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  i32.const 1
  global.set $~argumentsLength
  local.get $2
  call $~lib/string/String.UTF8.encode@varargs
  i32.const 1
  global.set $~argumentsLength
  call $~lib/typedarray/Uint8Array.wrap@varargs
  local.tee $4
  i32.load offset=8
  i32.const 224
  i32.lt_s
  if (result i32)
   local.get $4
   i32.load offset=8
  else
   i32.const 224
  end
  local.set $3
  local.get $0
  local.get $1
  i64.const 8
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.mul
  local.tee $7
  block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.7 (result i32)
   local.get $3
   i32.eqz
   if
    i64.const 0
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.7
   end
   local.get $3
   i32.const 1
   i32.eq
   if
    i64.const 1
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.7
   end
   local.get $3
   i64.extend_i32_u
   i64.const 0
   i64.const 0
   i64.const 0
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  end
  call $src/BlockBillContract/BlockBillContract#storeU256At
  i32.const 0
  local.set $1
  loop $for-loop|0
   local.get $1
   i32.const 7
   i32.lt_u
   if
    local.get $1
    i32.const 5
    i32.shl
    local.tee $5
    local.get $3
    i32.lt_u
    if
     i32.const 0
     i32.const 32
     call $~lib/typedarray/Uint8Array#constructor
     local.set $6
     i32.const 32
     local.get $3
     local.get $5
     i32.sub
     local.tee $2
     local.get $2
     i32.const 32
     i32.ge_u
     select
     local.set $8
     i32.const 0
     local.set $2
     loop $for-loop|1
      local.get $2
      local.get $8
      i32.lt_u
      if
       local.get $6
       local.get $2
       local.get $4
       local.get $2
       local.get $5
       i32.add
       call $~lib/typedarray/Uint8Array#__get
       call $~lib/typedarray/Uint8Array#__set
       local.get $2
       i32.const 1
       i32.add
       local.set $2
       br $for-loop|1
      end
     end
     local.get $0
     local.get $7
     block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.8 (result i32)
      local.get $1
      i32.const 1
      i32.add
      local.tee $2
      i32.eqz
      if
       i64.const 0
       i64.const 0
       i64.const 0
       i64.const 0
       call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
       br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.8
      end
      local.get $2
      i32.const 1
      i32.eq
      if
       i64.const 1
       i64.const 0
       i64.const 0
       i64.const 0
       call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
       br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.8
      end
      local.get $2
      i64.extend_i32_u
      i64.const 0
      i64.const 0
      i64.const 0
      call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
     end
     call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.add
     call $src/BlockBillContract/BlockBillContract#buildKey
     local.set $2
     global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
     local.get $2
     local.get $6
     call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#_internalSetStorageAt
     local.get $1
     i32.const 1
     i32.add
     local.set $1
     br $for-loop|0
    end
   end
  end
 )
 (func $src/BlockBillContract/BlockBillContract#storeU64At (param $0 i32) (param $1 i32) (param $2 i64)
  local.get $0
  local.get $1
  block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU64|inlined.1 (result i32)
   local.get $2
   i64.eqz
   if
    i64.const 0
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU64|inlined.1
   end
   local.get $2
   i64.const 1
   i64.eq
   if
    i64.const 1
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU64|inlined.1
   end
   local.get $2
   i64.const 0
   i64.const 0
   i64.const 0
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  end
  call $src/BlockBillContract/BlockBillContract#storeU256At
 )
 (func $src/BlockBillContract/BlockBillContract#storeU16At (param $0 i32) (param $1 i32) (param $2 i32)
  local.get $0
  local.get $1
  block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.9 (result i32)
   local.get $2
   i32.const 65535
   i32.and
   local.tee $0
   i32.eqz
   if
    i64.const 0
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.9
   end
   local.get $0
   i32.const 1
   i32.eq
   if
    i64.const 1
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.9
   end
   local.get $0
   i64.extend_i32_u
   i64.const 0
   i64.const 0
   i64.const 0
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  end
  call $src/BlockBillContract/BlockBillContract#storeU256At
 )
 (func $src/BlockBillContract/BlockBillContract#storeU8At (param $0 i32) (param $1 i32) (param $2 i32)
  local.get $0
  local.get $1
  block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.10 (result i32)
   local.get $2
   i32.const 255
   i32.and
   local.tee $0
   i32.eqz
   if
    i64.const 0
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.10
   end
   local.get $0
   i32.const 1
   i32.eq
   if
    i64.const 1
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.10
   end
   local.get $0
   i64.extend_i32_u
   i64.const 0
   i64.const 0
   i64.const 0
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  end
  call $src/BlockBillContract/BlockBillContract#storeU256At
 )
 (func $src/BlockBillContract/BlockBillContract#storeShortString (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  i32.const 1
  global.set $~argumentsLength
  local.get $2
  call $~lib/string/String.UTF8.encode@varargs
  i32.const 1
  global.set $~argumentsLength
  call $~lib/typedarray/Uint8Array.wrap@varargs
  local.tee $4
  i32.load offset=8
  i32.const 31
  i32.lt_s
  if (result i32)
   local.get $4
   i32.load offset=8
  else
   i32.const 31
  end
  local.set $2
  local.get $1
  i64.const 2
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.mul
  local.tee $1
  i64.const 1
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.add
  local.set $5
  local.get $0
  local.get $1
  block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.14 (result i32)
   local.get $2
   i32.eqz
   if
    i64.const 0
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.14
   end
   local.get $2
   i32.const 1
   i32.eq
   if
    i64.const 1
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.14
   end
   local.get $2
   i64.extend_i32_u
   i64.const 0
   i64.const 0
   i64.const 0
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  end
  call $src/BlockBillContract/BlockBillContract#storeU256At
  i32.const 0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
  local.set $1
  loop $for-loop|0
   local.get $2
   local.get $3
   i32.gt_u
   if
    local.get $1
    local.get $3
    local.get $4
    local.get $3
    call $~lib/typedarray/Uint8Array#__get
    call $~lib/typedarray/Uint8Array#__set
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  local.get $0
  local.get $5
  call $src/BlockBillContract/BlockBillContract#buildKey
  local.set $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.get $0
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#_internalSetStorageAt
 )
 (func $src/BlockBillContract/BlockBillContract#loadU256At (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  call $src/BlockBillContract/BlockBillContract#buildKey
  local.set $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.get $0
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#getStorageAt
  local.tee $0
  i32.load offset=8
  i32.const 32
  i32.ne
  if
   unreachable
  end
  local.get $0
  i32.load offset=4
  local.tee $0
  i64.load offset=24
  call $~lib/polyfills/bswap<u64>
  local.get $0
  i64.load offset=16
  call $~lib/polyfills/bswap<u64>
  local.get $0
  i64.load offset=8
  call $~lib/polyfills/bswap<u64>
  local.get $0
  i64.load
  call $~lib/polyfills/bswap<u64>
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
 )
 (func $src/BlockBillContract/BlockBillContract#addToCreatorIndex (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $1
  i32.load offset=8
  i32.const 32
  i32.ne
  if
   unreachable
  end
  local.get $1
  i32.load offset=4
  local.tee $1
  i64.load offset=24
  call $~lib/polyfills/bswap<u64>
  local.get $1
  i64.load offset=16
  call $~lib/polyfills/bswap<u64>
  local.get $1
  i64.load offset=8
  call $~lib/polyfills/bswap<u64>
  local.get $1
  i64.load
  call $~lib/polyfills/bswap<u64>
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  local.set $3
  local.get $0
  i32.load16_u offset=52
  local.get $3
  call $src/BlockBillContract/BlockBillContract#loadU256At
  local.tee $1
  i64.load
  i32.wrap_i64
  local.tee $4
  i32.const 1000
  i32.ge_u
  if
   unreachable
  end
  i64.const 1000
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  local.set $5
  local.get $3
  i64.load
  local.get $3
  i64.load offset=8
  local.get $3
  i64.load offset=16
  local.get $3
  i64.load offset=24
  local.get $5
  i64.load
  local.get $5
  i64.load offset=8
  local.get $5
  i64.load offset=16
  local.get $5
  i64.load offset=24
  call $~lib/@btc-vision/as-bignum/assembly/globals/__mul256
  block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.16 (result i32)
   local.get $4
   i32.eqz
   if
    i64.const 0
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.16
   end
   local.get $4
   i32.const 1
   i32.eq
   if
    i64.const 1
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.16
   end
   local.get $4
   i64.extend_i32_u
   i64.const 0
   i64.const 0
   i64.const 0
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  end
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.add
  local.set $4
  local.get $0
  i32.load16_u offset=54
  local.get $4
  local.get $2
  call $src/BlockBillContract/BlockBillContract#storeU256At
  local.get $0
  i32.load16_u offset=52
  local.get $3
  local.get $1
  i64.const 1
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.add
  call $src/BlockBillContract/BlockBillContract#storeU256At
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#isZero (param $0 i32) (result i32)
  (local $1 i32)
  loop $for-loop|0
   local.get $1
   local.get $0
   i32.load offset=8
   i32.lt_s
   if
    local.get $0
    local.get $1
    call $~lib/typedarray/Uint8Array#__get
    if
     i32.const 0
     return
    end
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|0
   end
  end
  i32.const 1
 )
 (func $src/BlockBillContract/BlockBillContract#addToRecipientIndex (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $1
  i32.load offset=8
  i32.const 32
  i32.ne
  if
   unreachable
  end
  local.get $1
  i32.load offset=4
  local.tee $1
  i64.load offset=24
  call $~lib/polyfills/bswap<u64>
  local.get $1
  i64.load offset=16
  call $~lib/polyfills/bswap<u64>
  local.get $1
  i64.load offset=8
  call $~lib/polyfills/bswap<u64>
  local.get $1
  i64.load
  call $~lib/polyfills/bswap<u64>
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  local.set $3
  local.get $0
  i32.load16_u offset=56
  local.get $3
  call $src/BlockBillContract/BlockBillContract#loadU256At
  local.tee $1
  i64.load
  i32.wrap_i64
  local.tee $4
  i32.const 1000
  i32.ge_u
  if
   unreachable
  end
  i64.const 1000
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  local.set $5
  local.get $3
  i64.load
  local.get $3
  i64.load offset=8
  local.get $3
  i64.load offset=16
  local.get $3
  i64.load offset=24
  local.get $5
  i64.load
  local.get $5
  i64.load offset=8
  local.get $5
  i64.load offset=16
  local.get $5
  i64.load offset=24
  call $~lib/@btc-vision/as-bignum/assembly/globals/__mul256
  block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.18 (result i32)
   local.get $4
   i32.eqz
   if
    i64.const 0
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.18
   end
   local.get $4
   i32.const 1
   i32.eq
   if
    i64.const 1
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.18
   end
   local.get $4
   i64.extend_i32_u
   i64.const 0
   i64.const 0
   i64.const 0
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  end
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.add
  local.set $4
  local.get $0
  i32.load16_u offset=58
  local.get $4
  local.get $2
  call $src/BlockBillContract/BlockBillContract#storeU256At
  local.get $0
  i32.load16_u offset=56
  local.get $3
  local.get $1
  i64.const 1
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.add
  call $src/BlockBillContract/BlockBillContract#storeU256At
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU256 (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  i32.const 32
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#allocSafe
  i32.const 0
  i32.const 32
  call $~lib/typedarray/Uint8Array#constructor
  local.tee $3
  i32.load offset=4
  local.tee $2
  local.get $1
  i64.load offset=24
  call $~lib/polyfills/bswap<u64>
  i64.store
  local.get $2
  local.get $1
  i64.load offset=16
  call $~lib/polyfills/bswap<u64>
  i64.store offset=8
  local.get $2
  local.get $1
  i64.load offset=8
  call $~lib/polyfills/bswap<u64>
  i64.store offset=16
  local.get $2
  local.get $1
  i64.load
  call $~lib/polyfills/bswap<u64>
  i64.store offset=24
  i32.const 0
  local.set $1
  loop $for-loop|0
   local.get $1
   i32.const 32
   i32.lt_s
   if
    local.get $0
    local.get $3
    local.get $1
    call $~lib/typedarray/Uint8Array#__get
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU8
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|0
   end
  end
 )
 (func $src/BlockBillContract/BlockBillContract#createInvoice (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i64)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readAddress
  local.set $8
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU256
  local.set $9
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readAddress
  local.set $3
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readStringWithLength
  local.set $6
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU64
  local.set $5
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU16
  local.set $10
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU16
  local.set $4
  i64.const 0
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  local.set $7
  local.get $9
  i64.load
  local.get $7
  i64.load
  i64.eq
  if (result i32)
   local.get $9
   i64.load offset=8
   local.get $7
   i64.load offset=8
   i64.eq
  else
   i32.const 0
  end
  if (result i32)
   local.get $9
   i64.load offset=16
   local.get $7
   i64.load offset=16
   i64.eq
  else
   i32.const 0
  end
  if (result i32)
   local.get $9
   i64.load offset=24
   local.get $7
   i64.load offset=24
   i64.eq
  else
   i32.const 0
  end
  if
   unreachable
  end
  local.get $4
  i32.const 65535
  i32.and
  i32.const 10
  i32.gt_u
  if
   unreachable
  end
  local.get $0
  i32.load offset=60
  local.tee $7
  local.get $0
  i32.load offset=60
  call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#get:value
  i64.const 1
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.add
  i32.store offset=12
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.get $7
  i32.load
  local.get $7
  call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#get:__value
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#_internalSetStorageAt
  local.get $0
  i32.load offset=60
  call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#get:value
  local.set $7
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.tee $11
  i32.load offset=24
  i32.eqz
  if
   unreachable
  end
  local.get $0
  i32.load16_u offset=22
  local.get $11
  i32.load offset=24
  local.tee $11
  i32.eqz
  if
   unreachable
  end
  local.get $7
  local.get $11
  i32.load offset=4
  local.tee $11
  call $src/BlockBillContract/BlockBillContract#storeAddressAt
  local.get $0
  i32.load16_u offset=24
  local.get $7
  local.get $8
  call $src/BlockBillContract/BlockBillContract#storeAddressAt
  local.get $0
  i32.load16_u offset=26
  local.get $7
  local.get $9
  call $src/BlockBillContract/BlockBillContract#storeU256At
  local.get $0
  i32.load16_u offset=28
  local.get $7
  local.get $3
  call $src/BlockBillContract/BlockBillContract#storeAddressAt
  local.get $0
  i32.load16_u offset=30
  local.get $7
  local.get $6
  call $src/BlockBillContract/BlockBillContract#storeLongString
  local.get $0
  i32.load16_u offset=32
  local.get $7
  local.get $5
  call $src/BlockBillContract/BlockBillContract#storeU64At
  local.get $0
  i32.load16_u offset=34
  local.get $7
  local.get $10
  call $src/BlockBillContract/BlockBillContract#storeU16At
  local.get $0
  i32.load16_u offset=36
  local.get $7
  i32.const 0
  call $src/BlockBillContract/BlockBillContract#storeU8At
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.tee $6
  i32.load offset=20
  i32.eqz
  if
   unreachable
  end
  local.get $0
  i32.load16_u offset=42
  local.get $6
  i32.load offset=20
  local.tee $6
  i32.eqz
  if
   unreachable
  end
  local.get $7
  local.get $6
  i64.load offset=8
  call $src/BlockBillContract/BlockBillContract#storeU64At
  local.get $0
  i32.load16_u offset=46
  local.get $7
  local.get $4
  call $src/BlockBillContract/BlockBillContract#storeU16At
  loop $for-loop|0
   local.get $2
   local.get $4
   i32.const 65535
   i32.and
   i32.lt_u
   if
    local.get $1
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readStringWithLength
    local.set $6
    local.get $1
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU256
    local.set $8
    local.get $7
    i64.const 10
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.mul
    block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.12 (result i32)
     local.get $2
     i32.eqz
     if
      i64.const 0
      i64.const 0
      i64.const 0
      i64.const 0
      call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
      br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.12
     end
     local.get $2
     i32.const 1
     i32.eq
     if
      i64.const 1
      i64.const 0
      i64.const 0
      i64.const 0
      call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
      br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.12
     end
     local.get $2
     i64.extend_i32_u
     i64.const 0
     i64.const 0
     i64.const 0
     call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    end
    call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.add
    local.set $9
    local.get $0
    i32.load16_u offset=48
    local.get $9
    local.get $6
    call $src/BlockBillContract/BlockBillContract#storeShortString
    local.get $0
    i32.load16_u offset=50
    local.get $9
    local.get $8
    call $src/BlockBillContract/BlockBillContract#storeU256At
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $0
  local.get $11
  local.get $7
  call $src/BlockBillContract/BlockBillContract#addToCreatorIndex
  local.get $3
  call $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#isZero@override
  i32.eqz
  if
   local.get $0
   local.get $3
   local.get $7
   call $src/BlockBillContract/BlockBillContract#addToRecipientIndex
  end
  i32.const 32
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#constructor
  local.tee $0
  local.get $7
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU256
  local.get $0
 )
 (func $src/BlockBillContract/BlockBillContract#assertInvoiceExists (param $0 i32) (param $1 i32)
  (local $2 i32)
  i64.const 0
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  local.set $2
  local.get $1
  i64.load
  local.get $2
  i64.load
  i64.eq
  if (result i32)
   local.get $1
   i64.load offset=8
   local.get $2
   i64.load offset=8
   i64.eq
  else
   i32.const 0
  end
  if (result i32)
   local.get $1
   i64.load offset=16
   local.get $2
   i64.load offset=16
   i64.eq
  else
   i32.const 0
  end
  if (result i32)
   local.get $1
   i64.load offset=24
   local.get $2
   i64.load offset=24
   i64.eq
  else
   i32.const 0
  end
  if (result i32)
   i32.const 1
  else
   local.get $0
   i32.load offset=60
   call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#get:value
   local.get $1
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.lt
  end
  if
   unreachable
  end
 )
 (func $src/BlockBillContract/BlockBillContract#loadAddressAt (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  call $src/BlockBillContract/BlockBillContract#buildKey
  local.set $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.get $0
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#getStorageAt
  local.set $0
  i32.const 0
  i32.const 0
  i32.const 0
  i32.const 8
  i32.const 6048
  call $~lib/rt/__newArray
  call $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#constructor
  local.tee $1
  i32.load offset=4
  local.get $0
  i32.load offset=4
  i32.const 32
  memory.copy
  local.get $1
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#equals (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  local.get $1
  i32.load offset=8
  local.get $0
  i32.load offset=8
  i32.ne
  if
   i32.const 0
   return
  end
  loop $for-loop|0
   local.get $2
   local.get $0
   i32.load offset=8
   i32.lt_s
   if
    local.get $0
    local.get $2
    call $~lib/typedarray/Uint8Array#__get
    local.get $1
    local.get $2
    call $~lib/typedarray/Uint8Array#__get
    i32.ne
    if
     i32.const 0
     return
    end
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  i32.const 1
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.sub (param $0 i32) (param $1 i32) (result i32)
  (local $2 i64)
  (local $3 i64)
  (local $4 i64)
  (local $5 i64)
  (local $6 i64)
  (local $7 i64)
  local.get $0
  local.get $1
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.lt
  if
   unreachable
  end
  local.get $0
  i64.load
  local.tee $3
  local.get $1
  i64.load
  i64.sub
  local.set $2
  local.get $2
  local.get $3
  i64.gt_u
  i64.extend_i32_s
  global.set $~lib/@btc-vision/as-bignum/assembly/globals/__u256carrySub
  local.get $0
  i64.load offset=8
  local.tee $3
  local.get $1
  i64.load offset=8
  i64.sub
  local.tee $4
  global.get $~lib/@btc-vision/as-bignum/assembly/globals/__u256carrySub
  i64.sub
  local.set $5
  local.get $4
  local.get $5
  i64.lt_u
  local.get $3
  local.get $4
  i64.lt_u
  i32.add
  i64.extend_i32_s
  global.set $~lib/@btc-vision/as-bignum/assembly/globals/__u256carrySub
  local.get $0
  i64.load offset=16
  local.tee $3
  local.get $1
  i64.load offset=16
  i64.sub
  local.tee $4
  global.get $~lib/@btc-vision/as-bignum/assembly/globals/__u256carrySub
  i64.sub
  local.set $6
  local.get $4
  local.get $6
  i64.lt_u
  local.get $3
  local.get $4
  i64.lt_u
  i32.add
  i64.extend_i32_s
  global.set $~lib/@btc-vision/as-bignum/assembly/globals/__u256carrySub
  local.get $0
  i64.load offset=24
  local.tee $4
  local.get $1
  i64.load offset=24
  i64.sub
  local.tee $3
  global.get $~lib/@btc-vision/as-bignum/assembly/globals/__u256carrySub
  i64.sub
  local.set $7
  local.get $3
  local.get $7
  i64.lt_u
  local.get $3
  local.get $4
  i64.gt_u
  i32.add
  i64.extend_i32_s
  global.set $~lib/@btc-vision/as-bignum/assembly/globals/__u256carrySub
  local.get $2
  local.get $5
  local.get $6
  local.get $7
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU32 (param $0 i32) (param $1 i32)
  local.get $0
  i32.const 4
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#allocSafe
  local.get $0
  i32.load offset=4
  local.get $0
  i32.load
  local.get $1
  call $~lib/dataview/DataView#setUint32
  local.get $0
  local.get $0
  i32.load
  i32.const 4
  i32.add
  i32.store
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/shared-libraries/TransferHelper/TransferHelper.transferFrom (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  i32.const 100
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#constructor
  local.tee $4
  i32.const 4144
  call $~lib/@btc-vision/btc-runtime/runtime/math/abi/encodeSelector
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU32
  local.get $4
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeAddress
  local.get $4
  local.get $2
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeAddress
  local.get $4
  local.get $3
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU256
  local.get $0
  i32.eqz
  if
   unreachable
  end
  local.get $0
  i32.load
  local.get $4
  i32.load offset=8
  i32.load
  local.get $4
  i32.load offset=4
  i32.load offset=8
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/FOUR_BYTES_UINT8ARRAY_MEMORY_CACHE
  i32.load
  call $~lib/@btc-vision/btc-runtime/runtime/env/global/callContract
  local.set $0
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/FOUR_BYTES_UINT8ARRAY_MEMORY_CACHE
  i32.load offset=4
  i32.load
  call $~lib/polyfills/bswap<u32>
  local.tee $1
  call $~lib/arraybuffer/ArrayBuffer#constructor
  local.set $2
  i32.const 0
  local.get $1
  local.get $2
  call $~lib/@btc-vision/btc-runtime/runtime/env/global/getCallResult
  local.get $0
  if
   local.get $0
   local.get $2
   local.get $1
   call $~lib/@btc-vision/btc-runtime/runtime/env/global/env_exit
  end
  i32.const 1
  global.set $~argumentsLength
  local.get $2
  call $~lib/typedarray/Uint8Array.wrap@varargs
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#constructor
  local.set $1
  i32.const 8
  i32.const 43
  call $~lib/rt/stub/__new
  local.tee $2
  local.get $0
  i32.eqz
  i32.store8
  local.get $2
  local.get $1
  i32.store offset=4
 )
 (func $src/BlockBillContract/BlockBillContract#payInvoice (param $0 i32) (param $1 i32) (result i32)
  (local $2 i64)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  local.get $0
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU256
  local.tee $4
  call $src/BlockBillContract/BlockBillContract#assertInvoiceExists
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.tee $1
  i32.load offset=24
  i32.eqz
  if
   unreachable
  end
  local.get $1
  i32.load offset=24
  local.tee $1
  i32.eqz
  if
   unreachable
  end
  local.get $1
  i32.load offset=4
  local.set $5
  local.get $0
  i32.load16_u offset=36
  local.get $4
  call $src/BlockBillContract/BlockBillContract#loadU256At
  i64.load
  i32.wrap_i64
  i32.const 255
  i32.and
  if
   unreachable
  end
  local.get $0
  i32.load16_u offset=32
  local.get $4
  call $src/BlockBillContract/BlockBillContract#loadU256At
  i64.load
  local.tee $2
  i64.const 0
  i64.ne
  if (result i32)
   global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
   local.tee $1
   i32.load offset=20
   i32.eqz
   if
    unreachable
   end
   local.get $1
   i32.load offset=20
   local.tee $1
   i32.eqz
   if
    unreachable
   end
   local.get $2
   local.get $1
   i64.load offset=8
   i64.lt_u
  else
   i32.const 0
  end
  if
   unreachable
  end
  local.get $5
  local.get $0
  i32.load16_u offset=22
  local.get $4
  call $src/BlockBillContract/BlockBillContract#loadAddressAt
  local.tee $1
  call $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#equals
  if
   unreachable
  end
  local.get $0
  i32.load16_u offset=28
  local.get $4
  call $src/BlockBillContract/BlockBillContract#loadAddressAt
  local.tee $3
  call $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#isZero@override
  if (result i32)
   i32.const 1
  else
   local.get $5
   local.get $3
   call $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#equals
  end
  i32.eqz
  if
   unreachable
  end
  local.get $0
  i32.load16_u offset=26
  local.get $4
  call $src/BlockBillContract/BlockBillContract#loadU256At
  local.set $3
  local.get $0
  i32.load16_u offset=24
  local.get $4
  call $src/BlockBillContract/BlockBillContract#loadAddressAt
  local.set $6
  local.get $3
  block $__inlined_func$~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.div$797 (result i32)
   local.get $3
   global.get $src/BlockBillContract/FEE_BPS
   call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.mul
   local.set $3
   global.get $src/BlockBillContract/BPS_DENOMINATOR
   local.tee $7
   i64.load offset=24
   local.get $7
   i64.load offset=16
   local.get $7
   i64.load
   local.get $7
   i64.load offset=8
   i64.or
   i64.or
   i64.or
   i64.eqz
   if
    unreachable
   end
   local.get $3
   i64.load offset=24
   local.get $3
   i64.load offset=16
   local.get $3
   i64.load
   local.get $3
   i64.load offset=8
   i64.or
   i64.or
   i64.or
   i64.eqz
   if
    i64.const 0
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    br $__inlined_func$~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.div$797
   end
   local.get $3
   local.get $7
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.div
  end
  local.tee $7
  call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.sub
  local.set $3
  local.get $0
  i32.load16_u offset=36
  local.get $4
  i32.const 1
  call $src/BlockBillContract/BlockBillContract#storeU8At
  local.get $0
  i32.load16_u offset=38
  local.get $4
  local.get $5
  call $src/BlockBillContract/BlockBillContract#storeAddressAt
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.tee $8
  i32.load offset=20
  i32.eqz
  if
   unreachable
  end
  local.get $0
  i32.load16_u offset=40
  local.get $8
  i32.load offset=20
  local.tee $8
  i32.eqz
  if
   unreachable
  end
  local.get $4
  local.get $8
  i64.load offset=8
  call $src/BlockBillContract/BlockBillContract#storeU64At
  local.get $6
  local.get $5
  local.get $1
  local.get $3
  call $~lib/@btc-vision/btc-runtime/runtime/shared-libraries/TransferHelper/TransferHelper.transferFrom
  i64.const 0
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  local.get $7
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.lt
  if
   local.get $6
   local.get $5
   local.get $0
   i32.load16_u offset=18
   i64.const 0
   i64.const 0
   i64.const 0
   i64.const 0
   call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
   call $src/BlockBillContract/BlockBillContract#loadAddressAt
   local.get $7
   call $~lib/@btc-vision/btc-runtime/runtime/shared-libraries/TransferHelper/TransferHelper.transferFrom
  end
  i32.const 1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#constructor
  local.tee $0
  i32.const 1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU8
  local.get $0
 )
 (func $src/BlockBillContract/BlockBillContract#markAsPaidBTC (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU256
  local.tee $2
  call $src/BlockBillContract/BlockBillContract#assertInvoiceExists
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readStringWithLength
  local.set $1
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.tee $3
  i32.load offset=24
  i32.eqz
  if
   unreachable
  end
  local.get $3
  i32.load offset=24
  local.tee $3
  i32.eqz
  if
   unreachable
  end
  local.get $3
  i32.load offset=4
  local.tee $3
  local.get $0
  i32.load16_u offset=22
  local.get $2
  call $src/BlockBillContract/BlockBillContract#loadAddressAt
  call $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#equals
  i32.eqz
  if
   unreachable
  end
  local.get $0
  i32.load16_u offset=36
  local.get $2
  call $src/BlockBillContract/BlockBillContract#loadU256At
  i64.load
  i32.wrap_i64
  i32.const 255
  i32.and
  if
   unreachable
  end
  local.get $0
  i32.load16_u offset=36
  local.get $2
  i32.const 1
  call $src/BlockBillContract/BlockBillContract#storeU8At
  local.get $0
  i32.load16_u offset=44
  local.get $2
  local.get $1
  call $src/BlockBillContract/BlockBillContract#storeLongString
  local.get $0
  i32.load16_u offset=38
  local.get $2
  local.get $3
  call $src/BlockBillContract/BlockBillContract#storeAddressAt
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.tee $1
  i32.load offset=20
  i32.eqz
  if
   unreachable
  end
  local.get $0
  i32.load16_u offset=40
  local.get $1
  i32.load offset=20
  local.tee $1
  i32.eqz
  if
   unreachable
  end
  local.get $2
  local.get $1
  i64.load offset=8
  call $src/BlockBillContract/BlockBillContract#storeU64At
  i32.const 1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#constructor
  local.tee $0
  i32.const 1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU8
  local.get $0
 )
 (func $src/BlockBillContract/BlockBillContract#loadLongString (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  local.get $0
  local.get $1
  i64.const 8
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.mul
  local.tee $6
  call $src/BlockBillContract/BlockBillContract#loadU256At
  i64.load
  i32.wrap_i64
  local.tee $1
  i32.eqz
  if
   i32.const 5808
   return
  end
  i32.const 0
  i32.const 224
  local.get $1
  local.get $1
  i32.const 224
  i32.ge_u
  select
  local.tee $3
  call $~lib/typedarray/Uint8Array#constructor
  local.set $4
  i32.const 0
  local.set $1
  loop $for-loop|0
   local.get $1
   i32.const 7
   i32.lt_u
   if
    local.get $1
    i32.const 5
    i32.shl
    local.tee $5
    local.get $3
    i32.lt_u
    if
     local.get $0
     local.get $6
     block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.20 (result i32)
      local.get $1
      i32.const 1
      i32.add
      local.tee $2
      i32.eqz
      if
       i64.const 0
       i64.const 0
       i64.const 0
       i64.const 0
       call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
       br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.20
      end
      local.get $2
      i32.const 1
      i32.eq
      if
       i64.const 1
       i64.const 0
       i64.const 0
       i64.const 0
       call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
       br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.20
      end
      local.get $2
      i64.extend_i32_u
      i64.const 0
      i64.const 0
      i64.const 0
      call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
     end
     call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.add
     call $src/BlockBillContract/BlockBillContract#buildKey
     local.set $2
     global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
     local.get $2
     call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#getStorageAt
     local.set $7
     i32.const 32
     local.get $3
     local.get $5
     i32.sub
     local.tee $2
     local.get $2
     i32.const 32
     i32.ge_u
     select
     local.set $8
     i32.const 0
     local.set $2
     loop $for-loop|1
      local.get $2
      local.get $8
      i32.lt_u
      if
       local.get $4
       local.get $2
       local.get $5
       i32.add
       local.get $7
       local.get $2
       call $~lib/typedarray/Uint8Array#__get
       call $~lib/typedarray/Uint8Array#__set
       local.get $2
       i32.const 1
       i32.add
       local.set $2
       br $for-loop|1
      end
     end
     local.get $1
     i32.const 1
     i32.add
     local.set $1
     br $for-loop|0
    end
   end
  end
  local.get $4
  i32.load
  local.tee $0
  local.get $0
  i32.const 20
  i32.sub
  i32.load offset=16
  call $~lib/string/String.UTF8.decodeUnsafe
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU64 (param $0 i32) (param $1 i64)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  i32.const 8
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#allocSafe
  local.get $0
  i32.load
  local.tee $2
  i32.const 31
  i32.shr_u
  local.get $0
  i32.load offset=4
  local.tee $3
  i32.load offset=8
  local.get $2
  i32.const 8
  i32.add
  i32.lt_s
  i32.or
  if
   unreachable
  end
  local.get $2
  local.get $3
  i32.load offset=4
  i32.add
  local.get $1
  call $~lib/polyfills/bswap<u64>
  i64.store
  local.get $0
  local.get $0
  i32.load
  i32.const 8
  i32.add
  i32.store
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU16 (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  i32.const 2
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#allocSafe
  local.get $0
  i32.load
  local.tee $2
  i32.const 31
  i32.shr_u
  local.get $0
  i32.load offset=4
  local.tee $3
  i32.load offset=8
  local.get $2
  i32.const 2
  i32.add
  i32.lt_s
  i32.or
  if
   unreachable
  end
  local.get $2
  local.get $3
  i32.load offset=4
  i32.add
  local.get $1
  call $~lib/polyfills/bswap<u16>
  i32.store16
  local.get $0
  local.get $0
  i32.load
  i32.const 2
  i32.add
  i32.store
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeStringWithLength (param $0 i32) (param $1 i32)
  i32.const 1
  global.set $~argumentsLength
  local.get $0
  local.get $1
  call $~lib/string/String.UTF8.encode@varargs
  local.tee $1
  i32.const 20
  i32.sub
  i32.load offset=16
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU32
  i32.const 1
  global.set $~argumentsLength
  local.get $0
  local.get $1
  call $~lib/typedarray/Uint8Array.wrap@varargs
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeBytes
 )
 (func $src/BlockBillContract/BlockBillContract#getInvoice (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i64)
  (local $6 i32)
  (local $7 i64)
  (local $8 i32)
  (local $9 i64)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU256
  local.set $12
  local.get $0
  i32.load16_u offset=22
  local.get $12
  call $src/BlockBillContract/BlockBillContract#loadAddressAt
  local.set $13
  local.get $0
  i32.load16_u offset=24
  local.get $12
  call $src/BlockBillContract/BlockBillContract#loadAddressAt
  local.set $1
  local.get $0
  i32.load16_u offset=26
  local.get $12
  call $src/BlockBillContract/BlockBillContract#loadU256At
  local.set $2
  local.get $0
  i32.load16_u offset=28
  local.get $12
  call $src/BlockBillContract/BlockBillContract#loadAddressAt
  local.set $3
  local.get $0
  i32.load16_u offset=36
  local.get $12
  call $src/BlockBillContract/BlockBillContract#loadU256At
  i64.load
  i32.wrap_i64
  local.set $4
  local.get $0
  i32.load16_u offset=32
  local.get $12
  call $src/BlockBillContract/BlockBillContract#loadU256At
  i64.load
  local.set $5
  local.get $0
  i32.load16_u offset=34
  local.get $12
  call $src/BlockBillContract/BlockBillContract#loadU256At
  i64.load
  i32.wrap_i64
  local.set $6
  local.get $0
  i32.load16_u offset=42
  local.get $12
  call $src/BlockBillContract/BlockBillContract#loadU256At
  i64.load
  local.set $7
  local.get $0
  i32.load16_u offset=38
  local.get $12
  call $src/BlockBillContract/BlockBillContract#loadAddressAt
  local.set $8
  local.get $0
  i32.load16_u offset=40
  local.get $12
  call $src/BlockBillContract/BlockBillContract#loadU256At
  i64.load
  local.set $9
  local.get $0
  i32.load16_u offset=30
  local.get $12
  call $src/BlockBillContract/BlockBillContract#loadLongString
  local.set $10
  local.get $0
  i32.load16_u offset=44
  local.get $12
  call $src/BlockBillContract/BlockBillContract#loadLongString
  local.set $11
  local.get $0
  i32.load16_u offset=46
  local.get $12
  call $src/BlockBillContract/BlockBillContract#loadU256At
  i64.load
  i32.wrap_i64
  local.set $0
  i32.const 500
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#constructor
  local.tee $12
  local.get $13
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeAddress
  local.get $12
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeAddress
  local.get $12
  local.get $2
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU256
  local.get $12
  local.get $3
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeAddress
  local.get $12
  local.get $4
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU8
  local.get $12
  local.get $5
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU64
  local.get $12
  local.get $6
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU16
  local.get $12
  local.get $7
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU64
  local.get $12
  local.get $8
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeAddress
  local.get $12
  local.get $9
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU64
  local.get $12
  local.get $10
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeStringWithLength
  local.get $12
  local.get $11
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeStringWithLength
  local.get $12
  local.get $0
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU16
  local.get $12
 )
 (func $src/BlockBillContract/BlockBillContract#getLineItems (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU256
  local.set $4
  local.get $0
  i32.load16_u offset=46
  local.get $4
  call $src/BlockBillContract/BlockBillContract#loadU256At
  i64.load
  i32.wrap_i64
  local.set $5
  i32.const 700
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#constructor
  local.tee $3
  local.get $5
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU16
  i32.const 0
  local.set $1
  loop $for-loop|0
   local.get $1
   local.get $5
   i32.const 65535
   i32.and
   i32.lt_u
   if
    local.get $4
    i64.const 10
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.mul
    block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.22 (result i32)
     local.get $1
     i32.eqz
     if
      i64.const 0
      i64.const 0
      i64.const 0
      i64.const 0
      call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
      br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.22
     end
     local.get $1
     i32.const 1
     i32.eq
     if
      i64.const 1
      i64.const 0
      i64.const 0
      i64.const 0
      call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
      br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.22
     end
     local.get $1
     i64.extend_i32_u
     i64.const 0
     i64.const 0
     i64.const 0
     call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    end
    call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.add
    local.set $6
    block $__inlined_func$src/BlockBillContract/BlockBillContract#loadShortString$113 (result i32)
     local.get $0
     i32.load16_u offset=48
     local.set $7
     i32.const 0
     local.set $2
     local.get $6
     i64.const 2
     i64.const 0
     i64.const 0
     i64.const 0
     call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
     call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.mul
     local.tee $8
     i64.const 1
     i64.const 0
     i64.const 0
     i64.const 0
     call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
     call $~lib/@btc-vision/btc-runtime/runtime/types/SafeMath/SafeMath.add
     local.set $9
     i32.const 5808
     local.get $7
     local.get $8
     call $src/BlockBillContract/BlockBillContract#loadU256At
     i64.load
     i32.wrap_i64
     local.tee $8
     i32.eqz
     br_if $__inlined_func$src/BlockBillContract/BlockBillContract#loadShortString$113
     drop
     local.get $7
     local.get $9
     call $src/BlockBillContract/BlockBillContract#buildKey
     local.set $7
     global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
     local.get $7
     call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#getStorageAt
     local.set $7
     i32.const 0
     i32.const 31
     local.get $8
     local.get $8
     i32.const 31
     i32.ge_u
     select
     local.tee $8
     call $~lib/typedarray/Uint8Array#constructor
     local.set $9
     loop $for-loop|00
      local.get $2
      local.get $8
      i32.lt_u
      if
       local.get $9
       local.get $2
       local.get $7
       local.get $2
       call $~lib/typedarray/Uint8Array#__get
       call $~lib/typedarray/Uint8Array#__set
       local.get $2
       i32.const 1
       i32.add
       local.set $2
       br $for-loop|00
      end
     end
     local.get $9
     i32.load
     local.tee $2
     local.get $2
     i32.const 20
     i32.sub
     i32.load offset=16
     call $~lib/string/String.UTF8.decodeUnsafe
    end
    local.set $2
    local.get $0
    i32.load16_u offset=50
    local.get $6
    call $src/BlockBillContract/BlockBillContract#loadU256At
    local.set $6
    local.get $3
    local.get $2
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeStringWithLength
    local.get $3
    local.get $6
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU256
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|0
   end
  end
  local.get $3
 )
 (func $src/BlockBillContract/BlockBillContract#getInvoicesByCreator (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readAddress
  local.tee $1
  i32.load offset=8
  i32.const 32
  i32.ne
  if
   unreachable
  end
  local.get $1
  i32.load offset=4
  local.tee $1
  i64.load offset=24
  call $~lib/polyfills/bswap<u64>
  local.get $1
  i64.load offset=16
  call $~lib/polyfills/bswap<u64>
  local.get $1
  i64.load offset=8
  call $~lib/polyfills/bswap<u64>
  local.get $1
  i64.load
  call $~lib/polyfills/bswap<u64>
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  local.set $2
  local.get $0
  i32.load16_u offset=52
  local.get $2
  call $src/BlockBillContract/BlockBillContract#loadU256At
  local.tee $1
  i64.load
  i32.wrap_i64
  local.tee $4
  i32.const 5
  i32.shl
  i32.const 32
  i32.add
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#constructor
  local.tee $3
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU256
  i32.const 0
  local.set $1
  loop $for-loop|0
   local.get $1
   local.get $4
   i32.lt_u
   if
    i64.const 1000
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    local.set $5
    local.get $2
    i64.load
    local.get $2
    i64.load offset=8
    local.get $2
    i64.load offset=16
    local.get $2
    i64.load offset=24
    local.get $5
    i64.load
    local.get $5
    i64.load offset=8
    local.get $5
    i64.load offset=16
    local.get $5
    i64.load offset=24
    call $~lib/@btc-vision/as-bignum/assembly/globals/__mul256
    block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.25 (result i32)
     local.get $1
     i32.eqz
     if
      i64.const 0
      i64.const 0
      i64.const 0
      i64.const 0
      call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
      br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.25
     end
     local.get $1
     i32.const 1
     i32.eq
     if
      i64.const 1
      i64.const 0
      i64.const 0
      i64.const 0
      call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
      br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.25
     end
     local.get $1
     i64.extend_i32_u
     i64.const 0
     i64.const 0
     i64.const 0
     call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    end
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.add
    local.set $5
    local.get $3
    local.get $0
    i32.load16_u offset=54
    local.get $5
    call $src/BlockBillContract/BlockBillContract#loadU256At
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU256
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|0
   end
  end
  local.get $3
 )
 (func $src/BlockBillContract/BlockBillContract#getInvoicesByRecipient (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readAddress
  local.tee $1
  i32.load offset=8
  i32.const 32
  i32.ne
  if
   unreachable
  end
  local.get $1
  i32.load offset=4
  local.tee $1
  i64.load offset=24
  call $~lib/polyfills/bswap<u64>
  local.get $1
  i64.load offset=16
  call $~lib/polyfills/bswap<u64>
  local.get $1
  i64.load offset=8
  call $~lib/polyfills/bswap<u64>
  local.get $1
  i64.load
  call $~lib/polyfills/bswap<u64>
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  local.set $2
  local.get $0
  i32.load16_u offset=56
  local.get $2
  call $src/BlockBillContract/BlockBillContract#loadU256At
  local.tee $1
  i64.load
  i32.wrap_i64
  local.tee $4
  i32.const 5
  i32.shl
  i32.const 32
  i32.add
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#constructor
  local.tee $3
  local.get $1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU256
  i32.const 0
  local.set $1
  loop $for-loop|0
   local.get $1
   local.get $4
   i32.lt_u
   if
    i64.const 1000
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    local.set $5
    local.get $2
    i64.load
    local.get $2
    i64.load offset=8
    local.get $2
    i64.load offset=16
    local.get $2
    i64.load offset=24
    local.get $5
    i64.load
    local.get $5
    i64.load offset=8
    local.get $5
    i64.load offset=16
    local.get $5
    i64.load offset=24
    call $~lib/@btc-vision/as-bignum/assembly/globals/__mul256
    block $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.27 (result i32)
     local.get $1
     i32.eqz
     if
      i64.const 0
      i64.const 0
      i64.const 0
      i64.const 0
      call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
      br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.27
     end
     local.get $1
     i32.const 1
     i32.eq
     if
      i64.const 1
      i64.const 0
      i64.const 0
      i64.const 0
      call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
      br $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.fromU32|inlined.27
     end
     local.get $1
     i64.extend_i32_u
     i64.const 0
     i64.const 0
     i64.const 0
     call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    end
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256.add
    local.set $5
    local.get $3
    local.get $0
    i32.load16_u offset=58
    local.get $5
    call $src/BlockBillContract/BlockBillContract#loadU256At
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU256
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|0
   end
  end
  local.get $3
 )
 (func $src/BlockBillContract/BlockBillContract#execute (param $0 i32) (param $1 i32) (param $2 i32) (result i32)
  local.get $1
  i32.const 1631905517
  i32.eq
  if
   local.get $0
   local.get $2
   call $src/BlockBillContract/BlockBillContract#createInvoice
   return
  end
  local.get $1
  i32.const -453789945
  i32.eq
  if
   local.get $0
   local.get $2
   call $src/BlockBillContract/BlockBillContract#payInvoice
   return
  end
  block $folding-inner0
   local.get $1
   i32.const 1762696973
   i32.eq
   if
    local.get $0
    local.get $2
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readU256
    local.tee $1
    call $src/BlockBillContract/BlockBillContract#assertInvoiceExists
    global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
    local.tee $2
    i32.load offset=24
    i32.eqz
    if
     unreachable
    end
    local.get $2
    i32.load offset=24
    local.tee $2
    i32.eqz
    if
     unreachable
    end
    local.get $2
    i32.load offset=4
    local.get $0
    i32.load16_u offset=22
    local.get $1
    call $src/BlockBillContract/BlockBillContract#loadAddressAt
    call $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#equals
    i32.eqz
    if
     unreachable
    end
    local.get $0
    i32.load16_u offset=36
    local.get $1
    call $src/BlockBillContract/BlockBillContract#loadU256At
    i64.load
    i32.wrap_i64
    i32.const 255
    i32.and
    if
     unreachable
    end
    local.get $0
    i32.load16_u offset=36
    local.get $1
    i32.const 2
    call $src/BlockBillContract/BlockBillContract#storeU8At
    br $folding-inner0
   end
   local.get $1
   i32.const 641750774
   i32.eq
   if
    local.get $0
    local.get $2
    call $src/BlockBillContract/BlockBillContract#markAsPaidBTC
    return
   end
   local.get $1
   i32.const -103902333
   i32.eq
   if
    local.get $2
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesReader/BytesReader#readAddress
    local.set $1
    global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
    local.tee $2
    i32.load offset=24
    i32.eqz
    if
     unreachable
    end
    local.get $2
    i32.load offset=24
    local.tee $2
    i32.eqz
    if
     unreachable
    end
    local.get $2
    i32.load offset=4
    local.get $1
    call $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#isZero@override
    if
     unreachable
    end
    local.get $0
    i32.load16_u offset=20
    i64.const 0
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    call $src/BlockBillContract/BlockBillContract#loadAddressAt
    call $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#equals
    i32.eqz
    if
     unreachable
    end
    local.get $0
    i32.load16_u offset=18
    i64.const 0
    i64.const 0
    i64.const 0
    i64.const 0
    call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
    local.get $1
    call $src/BlockBillContract/BlockBillContract#storeAddressAt
    br $folding-inner0
   end
   local.get $1
   i32.const -1970765343
   i32.eq
   if
    local.get $0
    local.get $2
    call $src/BlockBillContract/BlockBillContract#getInvoice
    return
   end
   local.get $1
   i32.const -1645247596
   i32.eq
   if
    local.get $0
    local.get $2
    call $src/BlockBillContract/BlockBillContract#getLineItems
    return
   end
   local.get $1
   i32.const -1034144289
   i32.eq
   if
    local.get $0
    local.get $2
    call $src/BlockBillContract/BlockBillContract#getInvoicesByCreator
    return
   end
   local.get $1
   i32.const 1251015232
   i32.eq
   if
    local.get $0
    local.get $2
    call $src/BlockBillContract/BlockBillContract#getInvoicesByRecipient
    return
   end
   local.get $1
   i32.const 479855591
   i32.eq
   if
    i32.const 32
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#constructor
    local.tee $1
    local.get $0
    i32.load offset=60
    call $~lib/@btc-vision/btc-runtime/runtime/storage/StoredU256/StoredU256#get:value
    call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU256
    local.get $1
    return
   end
   local.get $0
   local.get $1
   local.get $2
   call $~lib/@btc-vision/btc-runtime/runtime/contracts/OP_NET/OP_NET#execute
   return
  end
  i32.const 1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#constructor
  local.tee $0
  i32.const 1
  call $~lib/@btc-vision/btc-runtime/runtime/buffer/BytesWriter/BytesWriter#writeU8
  local.get $0
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/contracts/ReentrancyGuard/ReentrancyGuard#isSelectorExcluded@override (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  i32.const 8
  i32.sub
  i32.load
  drop
  local.get $1
  i32.const 1397356254
  i32.eq
  local.get $1
  i32.const -666993220
  i32.eq
  i32.or
  local.get $1
  i32.const -824401953
  i32.eq
  i32.or
  local.get $1
  i32.const 1570067551
  i32.eq
  i32.or
 )
 (func $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#isZero@override (param $0 i32) (result i32)
  local.get $0
  i32.const 8
  i32.sub
  i32.load
  i32.const 13
  i32.eq
  if
   local.get $0
   call $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#isZero
   return
  end
  local.get $0
  call $~lib/@btc-vision/btc-runtime/runtime/types/Address/Address#isZero
 )
 (func $~start
  (local $0 i32)
  global.get $~started
  if
   return
  end
  i32.const 1
  global.set $~started
  call $start:~lib/@btc-vision/btc-runtime/runtime/index
  i64.const 50
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  global.set $src/BlockBillContract/FEE_BPS
  i64.const 10000
  i64.const 0
  i64.const 0
  i64.const 0
  call $~lib/@btc-vision/as-bignum/assembly/integer/u256/u256#constructor
  global.set $src/BlockBillContract/BPS_DENOMINATOR
  global.get $~lib/@btc-vision/btc-runtime/runtime/env/index/Blockchain
  local.tee $0
  i32.const 5536
  i32.store offset=28
  local.get $0
  call $~lib/@btc-vision/btc-runtime/runtime/env/BlockchainEnvironment/BlockchainEnvironment#createContractIfNotExists
 )
)
