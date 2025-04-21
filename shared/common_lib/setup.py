from setuptools import setup, find_packages

setup(
    name='common_lib',
    version='0.1.0',
    author='Nico',
    author_email='nicodalessandro1l@gmail.com',
    description='A lightweight emoji-enhanced logging utility for ETL pipelines and CLI tools.',
    long_description="""
                    emoji_logger.py

                    A lightweight emoji-enhanced logging utility for ETL pipelines and data scripts.

                    Provides a set of simple functions for printing log messages with visual emoji
                    prefixes to distinguish log levels. Useful for CLI tools, ETL tasks, and debugging
                    in a clear and friendly format.

                    Log levels supported:
                    - 📊 info()     – General process updates
                    - ✅ success()  – Completed steps or milestones
                    - ⚠️ warning()  – Non-critical warnings or skipped items
                    - ❗ error()    – Errors or failures in execution
                    - 🐞 debug()    – Detailed developer logs (for debugging only)

                    Example usage:
                        from common_lib import emoji_logger as log

                        log.info("Starting ETL process")
                        log.success("Data successfully loaded")
                        log.warning("Missing values found")
                        log.error("Failed to write to database")
                        log.debug("Current record ID: 12345")
                    """,
    long_description_content_type='text/plain',
    url='https://github.com/youruser/uoc-tfg-auq',
    packages=find_packages(),
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'Topic :: Utilities',
        'Programming Language :: Python :: 3.11',
        'License :: OSI Approved :: MIT License',
    ],
    python_requires='>=3.8',
    install_requires=[],
    include_package_data=True
)
