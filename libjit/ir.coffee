
f_1 = (argc, argv) ->
  l0 = () ->
    cmp = argc == 3
    if cmp then l1 l0 else l2 l0
  l1 = () ->
    l1.val1 = argv[1]
    l1.val2 = argv[2]
    l1.call1 = atoi val1
    l1.call2 = atoi val2
    l1.add = call1 + call2
    l2 l1
  l2 = (phy) ->
    l2.cval = -1
    if phy is l0 then l2.retval = l2.cval
    if phy is l1 then l2.retval = l1.add
    l2.retval
  l0()

console.log f_1 5


