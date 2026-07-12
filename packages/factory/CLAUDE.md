# Factory Package

This package is for local Fabro factory tooling used to develop this repository.
It is not part of the shipped `ax` or `ax` CLI surfaces.

Use Effect for orchestration code in this package so future factory scripts can
share one runtime style as they grow beyond small one-off commands. Keep pure
helpers exported and covered with Bun tests.
