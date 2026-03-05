# To Pine Script® version 2

Pine Script version 2 is fully backwards compatible with version 1. As a result, all v1 scripts can be converted to v2 by adding the //@version=2 annotation to them.
An example v1 script:
study("Simple Moving Average", shorttitle="SMA")
src = close
length = input(10)
plot(sma(src, length))
The converted v2 script:
```pinescript
//@version=2
study("Simple Moving Average", shorttitle="SMA")
src = close
length = input(10)
plot(sma(src, length))         Previous       To Pine Script® version 3
```