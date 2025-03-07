/**
 * Copyright (c) Moodle Pty Ltd.
 *
 * Moodle is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Moodle is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Moodle.  If not, see <http://www.gnu.org/licenses/>.
 */

const { existsSync } = require('fs');
const path = require('path');

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
/** @type {import('@docusaurus/plugin-content-docs/src/sidebars/types').NormalizedSidebarItem} */
/** @type import('@site/src/utils/SupportedReleases') */

// TODO: This should _ideally_ use the @site/src/utils/SupportedReleases.ts library, but need to solve the inclusion of TS from Docusaurus config files.
const VersionData = require('../data/versions.json');

const Versions = Array(...VersionData.versions);

const today = new Date();

const isSupported = (versionData) => {
    if (versionData.extendedSecurityEndDate) {
        return (new Date(versionData.extendedSecurityEndDate)) > today;
    }

    return (new Date(versionData.securityEndDate)) > today;
};

const getTitle = (versionData) => {
    if (versionData.isLTS) {
        return `Moodle ${versionData.name} (LTS)`;
    }

    return `Moodle ${versionData.name}`;
};

const getReleaseEntry = (versionData) => ({
    label: getTitle(versionData),
    type: 'category',
    items: [],
    link: {
        type: 'doc',
        id: `releases/${versionData.name}`,
    },
});

module.exports = function getReleaseNotes() {
    const activeVersions = [];
    const archivedVersions = [];

    Versions.forEach((versionData) => {
        if (!existsSync(path.resolve(__dirname, '..', 'general', 'releases', versionData.name))) {
            if (!existsSync(path.resolve(__dirname, '..', 'general', 'releases', `${versionData.name}.md`))) {
                return;
            }
        }

        if (versionData.isExperimental) {
            return;
        }

        const entry = getReleaseEntry(versionData);
        if (existsSync(path.resolve(__dirname, '..', 'general', 'releases', versionData.name))) {
            entry.items.push({
                type: 'autogenerated',
                dirName: path.join('releases', versionData.name),
            });
        }

        if (isSupported(versionData)) {
            activeVersions.push(entry);
        } else {
            archivedVersions.push(entry);
        }
    });

    const releaseNotes = {
        label: 'Releases',
        type: 'category',
        items: [
            ...activeVersions,
            {
                label: 'Archive',
                type: 'category',
                items: archivedVersions,
            },
        ],
        link: {
            type: 'doc',
            id: 'releases',
        },
    };

    return releaseNotes;
};
