#!/bin/sh

config_path="${PWD}/.alexandria/alexandria-config.json"

if [ ! -f "$config_path" ]; then
	exit 0
fi

if ! command -v ax >/dev/null 2>&1; then
	exit 0
fi

# The plugin payload and ax ship as a version-matched pair, but the plugin
# marketplace can update the payload independently of ax. The commands below
# require the matching ax, so refuse to run against a skewed pair and say how
# to fix it. Installed payloads carry a VERSION file at their root; a source
# checkout (claude --plugin-dir) does not, and skips the check.
plugin_root="${CLAUDE_PLUGIN_ROOT:-}"
if [ -z "$plugin_root" ]; then
	script_dir="${0%/*}"           # strip /claude-monitor.sh
	plugin_root="${script_dir%/*}" # strip /scripts
fi
if [ -f "$plugin_root/VERSION" ]; then
	plugin_version="$(tr -d '[:space:]' <"$plugin_root/VERSION")"
	ax_version="$(ax version 2>/dev/null | awk '$1 == "Version:" { print $2; exit }')"
	if [ -n "$plugin_version" ] && [ -n "$ax_version" ] && [ "$plugin_version" != "$ax_version" ]; then
		echo "Alexandria plugin v${plugin_version} and ax v${ax_version} are out of sync." >&2
		echo "Run 'ax upgrade' to realign them; the Alexandria event monitor stays off until they match." >&2
		exit 1
	fi
fi

has_connection_args=false
connection_id="${ALEXANDRIA_CLAUDE_CONNECTION_ID:-host:claude-code:default}"
next_is_connection=false
for arg in "$@"; do
	if [ "$next_is_connection" = true ]; then
		connection_id="$arg"
		next_is_connection=false
		continue
	fi

	case "$arg" in
	--connection)
		has_connection_args=true
		next_is_connection=true
		;;
	--connection=*)
		has_connection_args=true
		connection_id="${arg#--connection=}"
		;;
	esac
done

if [ "$has_connection_args" = false ]; then
	set -- --connection "$connection_id" --cursor "$connection_id" "$@"
fi

ax inspect subscriptions register \
	--subscription "${connection_id}:raven-vision" \
	--connection "$connection_id" \
	--type raven.vision.source_attached \
	--type raven.vision.drafting_requested \
	--type raven.vision.slot.approved \
	--type raven.vision.slot.skipped \
	--if-missing \
	--json >/dev/null 2>&1 || true

ax inspect subscriptions register \
	--subscription "${connection_id}:frame-the-problem" \
	--connection "$connection_id" \
	--type play.requested \
	--type play.human_input_requested \
	--type play.human_input_resolved \
	--type play.completed \
	--if-missing \
	--json >/dev/null 2>&1 || true

exec ax internal host claude monitor "$@"
