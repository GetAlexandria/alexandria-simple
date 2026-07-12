# Alexandria Plugin Package

This package contains the shipped Alexandria plugin payload.

Alexandria starts with `ax-start`: a project bootstrap entry point
that detects whether Alexandria is configured for the current project. The
plugin owns guided play behavior. Durable product docs and viewer content live
in separate packages; release tooling bundles this payload for installation.
